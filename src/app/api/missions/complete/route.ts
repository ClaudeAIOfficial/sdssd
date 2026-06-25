import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { MissionCompletion } from '@/types';

const MIN_MISSION_TIME: Record<string, number> = {
  delivery: 20,
  taxi: 30,
  race: 45,
  collect_wallets: 40,
  defeat_gang: 50,
  protect_npc: 35,
  steal_package: 45,
  find_hardware_wallet: 30,
};

const MAX_SPEED = 35; // units per second — impossible to exceed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mission_id,
      player_id,
      wallet_address,
      start_time,
      end_time,
      distance_traveled,
      mission_type,
      time_limit,
    } = body as MissionCompletion & {
      wallet_address: string;
      mission_type: string;
      time_limit: number;
    };

    if (!mission_id || !player_id || !wallet_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const elapsed = (end_time - start_time) / 1000;

    // Anti-cheat: minimum time
    const minTime = MIN_MISSION_TIME[mission_type] || 20;
    if (elapsed < minTime) {
      return NextResponse.json(
        { error: 'Mission completed too quickly — suspicious activity detected' },
        { status: 400 }
      );
    }

    // Anti-cheat: max time
    if (elapsed > time_limit + 30) {
      return NextResponse.json({ error: 'Mission time limit exceeded' }, { status: 400 });
    }

    // Anti-cheat: speed check
    if (elapsed > 0 && distance_traveled / elapsed > MAX_SPEED) {
      return NextResponse.json(
        { error: 'Impossible movement speed detected' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Check for duplicate completion
    const { data: existing } = await supabase
      .from('mission_completions')
      .select('id')
      .eq('mission_id', mission_id)
      .eq('player_id', player_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Mission already completed' }, { status: 409 });
    }

    // Record the completion
    const { error: completionError } = await supabase.from('mission_completions').insert({
      mission_id,
      player_id,
      wallet_address,
      start_time: new Date(start_time).toISOString(),
      end_time: new Date(end_time).toISOString(),
      elapsed_seconds: Math.round(elapsed),
      distance_traveled: Math.round(distance_traveled),
      verified: true,
    });

    if (completionError) throw completionError;

    // Update player stats
    await supabase
      .from('players')
      .update({
        missions_completed: supabase.rpc('increment_field', {
          row_id: player_id,
          field_name: 'missions_completed',
          amount: 1,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', wallet_address);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Mission completion verified',
    });
  } catch (err) {
    console.error('POST /api/missions/complete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
