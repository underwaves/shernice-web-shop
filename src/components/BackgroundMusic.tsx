'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface BackgroundMusicProps {
  musicUrl?: string;
  enabled?: boolean;
}

export default function BackgroundMusic({
  musicUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  enabled = true,
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.35;
    audioRef.current.loop = true;

    // Respect autoplay policy: try to play if allowed, otherwise wait for first user gesture
    const tryAutoplay = async () => {
      try {
        if (enabled && audioRef.current) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch {
        // Autoplay blocked by browser policy; user will click to play
        setIsPlaying(false);
      }
    };

    tryAutoplay();

    const handleFirstGesture = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (enabled && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [musicUrl, enabled, hasInteracted]);

  if (!enabled || !musicUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src={musicUrl} preload="auto" />
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-md transition-all duration-300 backdrop-blur-md border ${
            isPlaying
              ? 'bg-rose-500/90 text-white border-rose-300 shadow-rose-200'
              : 'bg-white/80 text-rose-600 border-rose-200 hover:bg-rose-50'
          }`}
          title={isPlaying ? 'ปิดเสียงเพลง (Mute)' : 'เปิดเสียงเพลง (Play)'}
        >
          {isPlaying ? (
            <>
              <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">เปิดเพลงอยู่</span>
              <Volume2 className="w-4 h-4" />
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="text-gray-600 font-thai">เปิดเพลง</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
