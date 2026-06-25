import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

function verifyAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey || !authHeader) return false;
  return authHeader === `Bearer ${adminKey}`;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource');

  try {
    const supabase = getServiceClient();

    if (resource === 'stats') {
      const [players, rewards, completions] = await Promise.all([
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('rewards').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('mission_completions').select('id', { count: 'exact', head: true }),
      ]);

      return NextResponse.json({
        totalPlayers: players.count || 0,
        pendingRewards: rewards.count || 0,
        totalCompletions: completions.count || 0,
      });
    }

    if (resource === 'flagged') {
      const { data } = await supabase
        .from('mission_completions')
        .select('*')
        .eq('flagged', true)
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ flagged: data || [] });
    }

    return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, player_wallet, reward_id, ban_reason } = body;

    const supabase = getServiceClient();

    switch (action) {
      case 'ban_player': {
        if (!player_wallet) return NextResponse.json({ error: 'Missing player_wallet' }, { status: 400 });
        await supabase
          .from('players')
          .update({ is_banned: true, ban_reason: ban_reason || 'Violation of terms', updated_at: new Date().toISOString() })
          .eq('wallet_address', player_wallet);

        await supabase.from('admin_logs').insert({
          admin_id: 'system',
          action: 'ban_player',
          target_wallet: player_wallet,
          details: { reason: ban_reason || 'Violation of terms' },
        });

        return NextResponse.json({ success: true });
      }

      case 'approve_reward': {
        if (!reward_id) return NextResponse.json({ error: 'Missing reward_id' }, { status: 400 });
        await supabase
          .from('rewards')
          .update({
            status: 'processing',
            admin_approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', reward_id)
          .eq('status', 'pending');

        return NextResponse.json({ success: true, message: 'Reward queued for processing' });
      }

      case 'reject_reward': {
        if (!reward_id) return NextResponse.json({ error: 'Missing reward_id' }, { status: 400 });
        await supabase
          .from('rewards')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', reward_id);

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('Admin POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
