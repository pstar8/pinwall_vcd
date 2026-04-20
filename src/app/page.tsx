'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/rooms', { method: 'POST' });
      const data = await response.json();
      
      if (data.code && data.adminKey) {
        // Store admin key in localStorage
        localStorage.setItem(`pinwall_admin_${data.code}`, data.adminKey);
        router.push(`/room/${data.code}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length === 6) {
      setIsJoining(true);
      router.push(`/room/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-paper cork-pattern relative overflow-hidden">
      {/* Decorative scattered notes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-sticky-yellow rotate-[-15deg] shadow-lg flex items-center justify-center opacity-50 pointer-events-none">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 rotate-[-5deg]" />
      </div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-sticky-pink rotate-[10deg] shadow-lg flex items-center justify-center opacity-50 pointer-events-none">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500" />
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center mb-12"
      >
        <h1 className="text-6xl sm:text-8xl font-bold text-dark-brown mb-4 tracking-tighter">Pinwall</h1>
        <p className="text-2xl sm:text-3xl text-dark-brown/70 max-w-md mx-auto">
          a room-based anonymous message wall.
        </p>
      </motion.div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="z-10 w-full max-w-md flex flex-col gap-6"
      >
        {/* Create Room Card */}
        <div className="bg-white/80 backdrop-blur-md p-6 shadow-xl border-t-4 border-sticky-blue relative group overflow-hidden">
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Plus size={64} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Create a Wall</h2>
          <p className="text-xl text-dark-brown/60 mb-6">Start a new blank corkboard. You&apos;ll get an admin key automatically.</p>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full bg-dark-brown text-paper text-2xl py-3 flex items-center justify-center gap-2 hover:bg-dark-brown/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create New Room'}
            {!isCreating && <ArrowRight size={20} />}
          </button>
        </div>

        {/* Join Room Card */}
        <div className="bg-white/80 backdrop-blur-md p-6 shadow-xl border-t-4 border-sticky-orange relative group overflow-hidden">
          <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Join a Room</h2>
          <p className="text-xl text-dark-brown/60 mb-4">Have a 6-character room code?</p>
          <form onSubmit={handleJoinRoom} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="flex-1 bg-transparent border-b-2 border-dark-brown/20 focus:border-dark-brown outline-none text-3xl font-bold text-center tracking-widest uppercase transition-colors"
            />
            <button
              type="submit"
              disabled={joinCode.length !== 6 || isJoining}
              className="bg-accent text-paper px-6 py-2 flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isJoining ? '...' : <ArrowRight size={24} />}
            </button>
          </form>
        </div>

        {/* Public Wall Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/public-wall')}
            className="text-2xl text-dark-brown/70 hover:text-dark-brown underline decoration-wavy decoration-dark-brown/30 hover:decoration-dark-brown transition-all"
          >
            or visit the public wall
          </button>
        </div>
      </motion.div>
    </div>
  );
}
