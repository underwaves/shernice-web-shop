'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useStore } from './ThemeContextProvider';

interface BackgroundMusicProps {
  musicUrl?: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|music\.youtube\.com\/watch\?v=)([^#&?]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export default function BackgroundMusic({
  musicUrl: propMusicUrl,
  enabled: propEnabled,
}: BackgroundMusicProps) {
  const { settings } = useStore();
  const musicUrl =
    propMusicUrl ??
    settings?.bgMusicUrl ??
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';
  const enabled = propEnabled ?? settings?.bgMusicEnabled ?? true;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const youtubeId = getYouTubeVideoId(musicUrl);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize YouTube Iframe API if youtubeId is present
  useEffect(() => {
    if (!mounted || !enabled || !youtubeId) return;

    let isCancelled = false;

    function createPlayer() {
      if (isCancelled) return;
      const el = document.getElementById('yt-player-element');
      if (!el) return;

      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
      }

      try {
        ytPlayerRef.current = new window.YT.Player('yt-player-element', {
          height: '1',
          width: '1',
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: youtubeId,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              try {
                event.target.setVolume(35);
                event.target.unMute();
                if (enabled) {
                  event.target.playVideo();
                }
              } catch {}
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                event.target.playVideo();
              }
            },
            onError: () => {
              if (isCancelled) return;
              setIsPlaying(false);
            },
          },
        });
      } catch (err) {
        console.warn('Error creating YouTube player:', err);
      }
    }

    if (!window.YT || !window.YT.Player) {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        createPlayer();
      };
    } else {
      createPlayer();
    }

    return () => {
      isCancelled = true;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [youtubeId, enabled, mounted]);

  // Standard HTML Audio for non-YouTube URLs
  useEffect(() => {
    if (!mounted || youtubeId || !enabled || !musicUrl) return;

    if (!audioRef.current) return;
    audioRef.current.volume = 0.35;
    audioRef.current.loop = true;

    const tryAutoplay = async () => {
      try {
        if (enabled && audioRef.current) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch {
        setIsPlaying(false);
      }
    };

    tryAutoplay();
  }, [musicUrl, enabled, youtubeId, mounted]);

  // Handle first user gesture to unlock autoplay policy in strict browsers
  useEffect(() => {
    if (!mounted) return;

    const handleFirstGesture = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (enabled) {
          if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
            try {
              ytPlayerRef.current.unMute();
              ytPlayerRef.current.playVideo();
            } catch {}
          } else if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [enabled, youtubeId, hasInteracted, mounted]);

  if (!mounted || !enabled || !musicUrl) return null;

  const togglePlay = () => {
    if (youtubeId) {
      if (!ytPlayerRef.current || typeof ytPlayerRef.current.playVideo !== 'function') return;
      try {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch {}
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  return (
    <>
      {youtubeId ? (
        <div
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <div id="yt-player-element" />
        </div>
      ) : (
        <audio ref={audioRef} src={musicUrl} preload="auto" />
      )}

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
