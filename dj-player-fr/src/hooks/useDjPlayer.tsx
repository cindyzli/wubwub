import { useState, useRef, useEffect } from "react";

export function useDJPlayer(songs: string[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio nodes
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bassRef = useRef<BiquadFilterNode | null>(null);

  // state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75); // 0–100
  const [bass, setBass] = useState(50);     // 0–100, mapped later
  const [nightcore, setNightcore] = useState(false);

  // initialize audio + graph once
  useEffect(() => {
    ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";

    sourceRef.current = ctxRef.current.createMediaElementSource(audioRef.current);

    // create filter + gain
    bassRef.current = ctxRef.current.createBiquadFilter();
    bassRef.current.type = "lowshelf";
    bassRef.current.frequency.value = 200;

    gainRef.current = ctxRef.current.createGain();

    // connect chain: audio → bass → gain → destination
    sourceRef.current
      .connect(bassRef.current)
      .connect(gainRef.current)
      .connect(ctxRef.current.destination);

    // when song ends → next
    audioRef.current.addEventListener("ended", () => {
      setCurrentIndex((i) => (i + 1) % songs.length);
    });
  }, []);

  // update song when index changes
  useEffect(() => {
    if (!audioRef.current || songs.length === 0) return;
    audioRef.current.src = songs[currentIndex];
    if (isPlaying) {
      ctxRef.current?.resume();
      audioRef.current.play().catch((err) => {
        if (err.name !== "AbortError") console.error("Play failed:", err);
      });
    }
  }, [currentIndex, songs, isPlaying]);

  // apply volume
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume / 100; // 0.0–1.0
    }
  }, [volume]);

  // apply bass
  useEffect(() => {
    if (bassRef.current) {
      // map slider (0–100) → -30 to +30 dB
      bassRef.current.gain.value = (bass - 50) * (60 / 100);
    }
  }, [bass]);

  // apply nightcore
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = nightcore ? 1.25 : 1.0;
    }
  }, [nightcore]);

  // controls
  const play = () => {
    if (!audioRef.current) return;
    ctxRef.current?.resume();
    audioRef.current.play().catch((err) => {
      if (err.name !== "AbortError") console.error("Play failed:", err);
    });
    setIsPlaying(true);
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextSong = () => {
    if (songs.length > 0) {
      setCurrentIndex((i) => (i + 1) % songs.length);
    }
  };

  const playSongAt = (i: number) => {
    if (i >= 0 && i < songs.length) {
      setCurrentIndex(i);
      setIsPlaying(true);
    }
  };

  return {
    play,
    pause,
    stop,
    nextSong,
    playSongAt,
    setVolume,
    setBass,
    toggleNightcore: () => setNightcore((n) => !n),
    isPlaying,
    nightcore,
    volume,
    bass,
    audioEl: audioRef.current,
  };
}
