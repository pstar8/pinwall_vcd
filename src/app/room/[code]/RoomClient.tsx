'use client';

import { useState, useEffect } from 'react';
import Board from '@/components/Board';
import type { Note } from '@/components/StickyNote';

interface RoomClientProps {
  room: {
    id: string;
    code: string;
  };
  initialNotes: Note[];
}

export default function RoomClient({ room, initialNotes }: RoomClientProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for admin key
    const key = localStorage.getItem(`pinwall_admin_${room.code}`);
    if (key) {
      setAdminKey(key);
      setIsAdmin(true);
    }
  }, [room.code]);

  return (
    <>
      {isAdmin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-dark-brown/90 text-paper px-4 py-1 rounded-full text-sm z-40 shadow-lg pointer-events-none flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>You are an admin of this room</span>
        </div>
      )}
      <Board
        roomId={room.id}
        initialNotes={initialNotes}
        isAdmin={isAdmin}
        adminKey={adminKey}
      />
    </>
  );
}
