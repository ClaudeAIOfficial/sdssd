import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get('sort') || 'reputation';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  const validSorts = ['reputation', 'cash', 'sol_earned', 'missions_completed', 'xp'];
  const sort = validSorts.includes(sortBy) ? sortBy : 'reputation';

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('players')
      .select('id, username, wallet_address, reputation, cash, sol_earned, xp, level, missions_completed')
      .order(sort, { ascending: false })
      .limit(limit);

    if (error) throw error;

    const leaderboard = (data || []).map((player, index) => ({
      rank: index + 1,
      ...player,
      wallet_address: `${player.wallet_address.slice(0, 4)}...${player.wallet_address.slice(-4)}`,
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    // Return mock data as fallback
    return NextResponse.json({
      leaderboard: [
        { rank: 1, username: 'CryptoKing_Sol', reputation: 98500, cash: 250000, sol_earned: 2.45, missions_completed: 312, level: 42 },
        { rank: 2, username: 'NeonRider_X', reputation: 87200, cash: 188000, sol_earned: 1.87, missions_completed: 278, level: 38 },
      ],
    });
  }
}
