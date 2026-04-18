import { supabase } from '@/utils/supabase';
import Board from '@/components/Board';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicWallPage() {
  // Fetch initial notes for public wall (room_id is null)
  const { data: initialNotes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .is('room_id', null)
    .order('created_at', { ascending: true });

  if (notesError) {
    console.error('Error fetching public notes:', notesError);
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
          <h1 className="text-4xl font-bold tracking-tight">Public Wall</h1>
        </div>
        <div className="text-xl opacity-70">Anyone can post</div>
      </header>

      {/* Main Board Area */}
      <div className="flex-1 relative">
        <Board
          roomId={null}
          initialNotes={initialNotes || []}
          isAdmin={false} // Public wall has no admin
        />
      </div>
    </div>
  );
}
