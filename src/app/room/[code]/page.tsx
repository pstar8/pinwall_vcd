import { supabase } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import RoomClient from './RoomClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Tell Next.js we want to fetch this dynamically on every request, 
// though revalidation is better. For MVP, force dynamic since we don't have caching setup.
export const dynamic = 'force-dynamic';

export default async function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();

  // Fetch room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, code')
    .eq('code', code)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // Fetch initial notes
  const { data: initialNotes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: true });

  if (notesError) {
    console.error('Error fetching notes:', notesError);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Header */}
      <header className="h-20 bg-dark-brown text-paper flex items-center justify-between px-6 shadow-md z-40 relative">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-accent transition-colors flex items-center gap-2 text-2xl">
            <ArrowLeft size={24} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Room: {code}</h1>
        </div>
        <div className="text-xl opacity-70">Pinwall</div>
      </header>

      {/* Main Board Area */}
      <div className="flex-1 relative">
        <RoomClient room={room} initialNotes={initialNotes || []} />
      </div>
    </div>
  );
}
