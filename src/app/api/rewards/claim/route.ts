import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player_id, wallet_address, mission_id } = body;

    if (!player_id || !wallet_address || !mission_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Verify mission was completed and has SOL reward
    const { data: completion } = await supabase
      .from('mission_completions')
      .select('*, missions(sol_reward, type)')
      .eq('mission_id', mission_id)
      .eq('player_id', player_id)
      .eq('verified', true)
      .single();

    if (!completion) {
      return NextResponse.json({ error: 'Mission completion not found or not verified' }, { status: 404 });
    }

    // Check if already claimed
    const { data: existingReward } = await supabase
      .from('rewards')
      .select('id')
      .eq('mission_id', mission_id)
      .eq('player_id', player_id)
      .single();

    if (existingReward) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 409 });
    }

    const solAmount = completion.missions?.sol_reward || 0;
    if (solAmount <= 0) {
      return NextResponse.json({ error: 'No SOL reward for this mission' }, { status: 400 });
    }

    // In production: execute real Solana transaction here using reward wallet
    // For MVP: record the pending reward
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .insert({
        player_id,
        wallet_address,
        mission_id,
        amount_sol: solAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (rewardError) throw rewardError;

    // Update player sol_earned
    await supabase.rpc('add_player_sol', {
      p_wallet: wallet_address,
      p_amount: solAmount,
    });

    return NextResponse.json({
      success: true,
      reward_id: reward.id,
      amount_sol: solAmount,
      status: 'pending',
      message: 'Reward queued for processing. Transaction will be sent within 24 hours.',
    });
  } catch (err) {
    console.error('POST /api/rewards/claim error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
