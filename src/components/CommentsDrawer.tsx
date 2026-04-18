'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import type { Note } from './StickyNote';

interface Comment {
  id: string;
  note_id: string;
  content: string;
  created_at: string;
}

interface CommentsDrawerProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsDrawer({ note, isOpen, onClose }: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !note) return;

    const fetchComments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('note_id', note.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
        scrollToBottom();
      }
      setIsLoading(false);
    };

    fetchComments();

    // Subscribe to realtime comments for this note
    const channel = supabase
      .channel(`comments-${note.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `note_id=eq.${note.id}`,
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, note]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting || !note || !note.comments_enabled) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: note.id, content: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      setNewComment('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-dark-brown/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-paper shadow-2xl z-50 flex flex-col border-l-4 border-dark-brown/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-brown/10 flex justify-between items-center bg-paper sticky top-0 z-10">
              <h2 className="text-3xl font-bold text-dark-brown">Comments</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-dark-brown/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Note Preview */}
            {note && (
              <div className="p-4 bg-dark-brown/5 border-b border-dark-brown/10">
                <div className={`p-3 rounded shadow-sm text-xl ${note.color.replace('sticky-', 'bg-sticky-')}`}>
                  {note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {isLoading ? (
                <div className="text-center text-dark-brown/50 text-xl py-8 animate-pulse">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-dark-brown/50 text-xl py-8">No comments yet. Be the first!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white/50 rounded-lg p-3 shadow-sm border border-dark-brown/5">
                    <p className="text-xl whitespace-pre-wrap break-words">{comment.content}</p>
                    <p className="text-xs text-dark-brown/40 mt-2 font-sans text-right">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-dark-brown/10 bg-paper">
              {note?.comments_enabled ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add an anonymous comment..."
                    className="flex-1 bg-white border-2 border-dark-brown/20 rounded-xl px-4 py-3 text-xl outline-none focus:border-dark-brown transition-colors"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="bg-dark-brown text-paper p-3 rounded-xl hover:bg-dark-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
                  >
                    <Send size={24} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-dark-brown/50 py-4 bg-dark-brown/5 rounded-xl">
                  <AlertCircle size={20} />
                  <span className="text-xl">Comments are disabled for this note</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
