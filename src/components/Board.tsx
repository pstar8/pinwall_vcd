'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Plus } from 'lucide-react';
import StickyNote, { Note } from './StickyNote';
import AddNoteModal from './AddNoteModal';
import CommentsDrawer from './CommentsDrawer';

interface BoardProps {
  roomId: string | null; // null for public wall
  initialNotes: Note[];
  isAdmin: boolean;
  adminKey?: string | null;
}

export default function Board({ roomId, initialNotes, isAdmin, adminKey }: BoardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    // Subscribe to realtime notes for this room
    // For public wall, we filter where room_id is null.
    // Supabase JS client handles `is null` with `is('room_id', null)` but in realtime filters, 
    // it's tricky. Realtime filter for null is `room_id=is.null`.
    
    const filter = roomId ? `room_id=eq.${roomId}` : 'room_id=is.null';

    const channel = supabase
      .channel(`notes-${roomId || 'public'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: filter,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [...prev, payload.new as Note]);
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
            if (selectedNote?.id === payload.old.id) {
              setSelectedNote(null);
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Note) : n))
            );
            if (selectedNote?.id === payload.new.id) {
              setSelectedNote(payload.new as Note);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, selectedNote]);

  const handleAddNote = async (content: string, color: string, attachment: string) => {
    // Generate a random rotation between -10 and 10 degrees
    const rotation = Math.random() * 20 - 10;
    
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: roomId,
        content,
        color,
        rotation,
        attachment_type: attachment,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!isAdmin || !adminKey) return;
    
    try {
      const response = await fetch(`/api/notes?id=${id}&room_id=${roomId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey,
        },
      });

      if (!response.ok) {
        console.error('Failed to delete note');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComments = async (id: string, currentStatus: boolean) => {
    if (!isAdmin || !adminKey) return;

    try {
      const response = await fetch('/api/notes/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({
          id,
          room_id: roomId,
          comments_enabled: !currentStatus,
        }),
      });

      if (!response.ok) {
        console.error('Failed to toggle comments');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] p-4 sm:p-8 overflow-hidden cork-pattern">
      {/* Empty State */}
      {notes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-56 h-56 p-4 bg-paper shadow-lg flex flex-col justify-center items-center text-center rotate-3 border border-dark-brown/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md border border-red-700" />
            <p className="text-3xl text-dark-brown/70">nothing here yet.</p>
            <p className="text-2xl text-dark-brown/50">be the first.</p>
          </div>
        </div>
      )}

      {/* Board Layout */}
      {/* We use flex layout to simulate masonry but allowing wrapping. The individual sticky notes handle their own drag constraints. */}
      <div className="flex flex-wrap gap-6 justify-center items-center h-full">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            isAdmin={isAdmin}
            onDelete={handleDeleteNote}
            onToggleComments={handleToggleComments}
            onClick={setSelectedNote}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-accent text-paper rounded-full shadow-xl flex items-center justify-center hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all z-30 border-2 border-paper/20"
      >
        <Plus size={32} />
      </button>

      {/* Modals */}
      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNote}
      />

      <CommentsDrawer
        note={selectedNote}
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </div>
  );
}
