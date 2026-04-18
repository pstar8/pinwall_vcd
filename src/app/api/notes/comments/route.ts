import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, room_id, comments_enabled } = body;
    const adminKey = request.headers.get('x-admin-key');

    if (!id || room_id === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!room_id) {
      return NextResponse.json({ error: 'Cannot modify public wall notes' }, { status: 403 });
    }

    // Verify admin key
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('admin_key')
      .eq('id', room_id)
      .single();

    if (roomError || !room || room.admin_key !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update note
    const { error } = await supabase
      .from('notes')
      .update({ comments_enabled })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
