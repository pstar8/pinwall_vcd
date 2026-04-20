import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room_id, content, color, rotation, attachment_type } = body;

    const { data, error } = await supabase
      .from('notes')
      .insert([
        { room_id, content, color, rotation, attachment_type, comments_enabled: true }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roomId = searchParams.get('room_id');
    const adminKey = request.headers.get('x-admin-key');

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // For public wall (room_id is null/undefined), maybe we don't allow deletion, or allow anyone? 
    // The prompt says "The room creator gets a 6-char room code to share and a secret admin key that lets them delete notes".
    // Public wall doesn't have an admin key. We'll just prevent deletions on the public wall for simplicity.
    if (!roomId) {
      return NextResponse.json({ error: 'Cannot delete notes on the public wall' }, { status: 403 });
    }

    // Verify admin key
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('admin_key')
      .eq('id', roomId)
      .single();

    if (roomError || !room || room.admin_key !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete note
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
