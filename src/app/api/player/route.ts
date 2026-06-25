import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ player: null }, { status: 200 });
    }

    if (error) throw error;
    return NextResponse.json({ player: data });
  } catch (err) {
    console.error('GET /api/player error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, username } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Missing wallet_address' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Check if player exists
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('wallet_address', wallet_address)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Player already exists' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('players')
      .insert({
        wallet_address,
        username: username || `Player_${wallet_address.slice(0, 6)}`,
        cash: 1000,
        sol_earned: 0,
        xp: 0,
        reputation: 0,
        level: 1,
        skin_tone: '#F4C88E',
        hair_style: 'short',
        clothes_style: 'casual',
        shoes_style: 'sneakers',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ player: data }, { status: 201 });
  } catch (err) {
    console.error('POST /api/player error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, updates } = body;

    if (!wallet_address || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only allow safe field updates
    const allowedFields = ['username', 'skin_tone', 'hair_style', 'clothes_style', 'shoes_style'];
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key))
    );

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('players')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('wallet_address', wallet_address)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ player: data });
  } catch (err) {
    console.error('PATCH /api/player error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
