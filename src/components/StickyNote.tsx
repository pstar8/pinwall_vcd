'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, MessageSquare, MessageSquareOff } from 'lucide-react';

export type Note = {
  id: string;
  room_id: string | null;
  content: string;
  color: string;
  rotation: number;
  attachment_type: string;
  comments_enabled: boolean;
  created_at: string;
};

interface StickyNoteProps {
  note: Note;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onToggleComments: (id: string, currentStatus: boolean) => void;
  onClick: (note: Note) => void;
}

export default function StickyNote({ note, isAdmin, onDelete, onToggleComments, onClick }: StickyNoteProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Map color names to Tailwind classes or hex values
  const colorMap: Record<string, string> = {
    'sticky-yellow': 'bg-sticky-yellow text-dark-brown',
    'sticky-blue': 'bg-sticky-blue text-dark-brown',
    'sticky-pink': 'bg-sticky-pink text-dark-brown',
    'sticky-green': 'bg-sticky-green text-dark-brown',
    'sticky-purple': 'bg-sticky-purple text-dark-brown',
    'sticky-orange': 'bg-sticky-orange text-dark-brown',
  };

  const colorClass = colorMap[note.color] || 'bg-sticky-yellow text-dark-brown';

  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }} // Allow some freedom but snap back or constrain
      whileDrag={{ scale: 1.05, zIndex: 50, rotate: 0 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
      initial={{ scale: 0, rotate: note.rotation + 20, opacity: 0 }}
      animate={{ scale: 1, rotate: note.rotation, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative w-48 h-48 sm:w-56 sm:h-56 p-4 shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-between ${colorClass}`}
      style={{
        boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.2)' : '2px 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Attachment Visual */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex justify-center w-full pointer-events-none">
        {note.attachment_type === 'pin' ? (
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[2px_2px_4px_rgba(0,0,0,0.3)] border border-red-700 relative">
            <div className="absolute top-[2px] left-[2px] w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-gray-400 -z-10" />
          </div>
        ) : (
          <div className="w-16 h-6 bg-white/40 backdrop-blur-sm shadow-sm rotate-[-2deg] border border-white/20" />
        )}
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar mt-2 text-xl md:text-2xl whitespace-pre-wrap break-words"
        onClick={(e) => {
          // If we are just viewing, open comments. Prevent triggering if dragging
          onClick(note);
        }}
      >
        {note.content}
      </div>

      {/* Footer / Actions */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-dark-brown/10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick(note);
          }}
          className="text-sm flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          {note.comments_enabled ? <MessageSquare size={16} /> : <MessageSquareOff size={16} />}
          <span>Comments</span>
        </button>

        {isAdmin && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onToggleComments(note.id, note.comments_enabled)}
              className="p-1 rounded hover:bg-dark-brown/10 text-dark-brown/70 hover:text-dark-brown transition-colors"
              title={note.comments_enabled ? "Disable comments" : "Enable comments"}
            >
              {note.comments_enabled ? <MessageSquareOff size={18} /> : <MessageSquare size={18} />}
            </button>
            <button 
              onClick={() => onDelete(note.id)}
              className="p-1 rounded hover:bg-red-500/20 text-red-600/70 hover:text-red-600 transition-colors"
              title="Delete note"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
