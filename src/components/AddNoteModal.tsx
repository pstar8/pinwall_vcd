'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (content: string, color: string, attachment: string) => Promise<void>;
}

const colors = [
  'sticky-yellow',
  'sticky-blue',
  'sticky-pink',
  'sticky-green',
  'sticky-purple',
  'sticky-orange',
];

const colorClasses: Record<string, string> = {
  'sticky-yellow': 'bg-sticky-yellow',
  'sticky-blue': 'bg-sticky-blue',
  'sticky-pink': 'bg-sticky-pink',
  'sticky-green': 'bg-sticky-green',
  'sticky-purple': 'bg-sticky-purple',
  'sticky-orange': 'bg-sticky-orange',
};

export default function AddNoteModal({ isOpen, onClose, onAdd }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('sticky-yellow');
  const [attachment, setAttachment] = useState('pin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(content, selectedColor, attachment);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Failed to add note', error);
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
            className="fixed inset-0 z-50 bg-dark-brown/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
              className={`relative w-full max-w-sm sm:max-w-md aspect-square p-6 sm:p-8 shadow-2xl pointer-events-auto flex flex-col ${colorClasses[selectedColor]} text-dark-brown`}
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-dark-brown/10 transition-colors"
              >
                <X size={24} />
              </button>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your anonymous note here..."
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-2xl sm:text-3xl placeholder:text-dark-brown/40 custom-scrollbar mt-4"
                autoFocus
              />

              <div className="mt-4 pt-4 border-t border-dark-brown/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-transform ${colorClasses[c]} ${selectedColor === c ? 'border-dark-brown scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`}
                        title={c.replace('sticky-', '')}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex bg-dark-brown/5 rounded-lg p-1">
                    <button
                      onClick={() => setAttachment('pin')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${attachment === 'pin' ? 'bg-dark-brown text-paper' : 'hover:bg-dark-brown/10'}`}
                    >
                      Push Pin
                    </button>
                    <button
                      onClick={() => setAttachment('tape')}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${attachment === 'tape' ? 'bg-dark-brown text-paper' : 'hover:bg-dark-brown/10'}`}
                    >
                      Tape
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || isSubmitting}
                    className="flex items-center gap-2 bg-dark-brown text-paper px-4 py-2 rounded-lg font-bold hover:bg-dark-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Post</span>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
