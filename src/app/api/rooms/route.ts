import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST() {
  try {
    const code = generateRoomCode();
    const adminKey = uuidv4();

    // In a real scenario we'd check for code collision, but 36^6 is large enough for MVP
    const { data, error } = await supabase
      .from('rooms')
      .insert([
        { code, admin_key: adminKey }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ code: data.code, adminKey: data.admin_key });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
