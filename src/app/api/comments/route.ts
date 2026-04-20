import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { note_id, content } = body;

    // Check if comments are enabled for this note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('comments_enabled')
      .eq('id', note_id)
      .single();

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (!note.comments_enabled) {
      return NextResponse.json({ error: 'Comments are disabled for this note' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        { note_id, content }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
