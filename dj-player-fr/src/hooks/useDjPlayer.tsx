import { useState, useRef, useEffect } from "react";

export function useDJPlayer(songs: string[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🔊 NEW state
  const [volume, setVolume] = useState(75); // percent 0–100
  const [bass, setBass] = useState(50);     // dummy example, 0–100
  const [nightcore, setNightcore] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // load song when index changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = songs[currentIndex];
    if (isPlaying) {
      void audioRef.current.play();
    }
  }, [currentIndex, songs]);

  // apply volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100; // scale to 0–1
    }
  }, [volume]);

  // apply nightcore
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = nightcore ? 1.75 : 1.0;
    }
  }, [nightcore]);

  // TODO: apply bass with WebAudio filter if you want real EQ
  useEffect(() => {
    console.log("Bass set to", bass);
  }, [bass]);

  const play = () => {
    if (!audioRef.current) return;
    void audioRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause(); // 👈 doesn’t reset currentTime
    setIsPlaying(false);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const nextSong = () => {
    setCurrentIndex((i) => (i + 1) % songs.length);
  };

  const playSongAt = (index: number) => {
    if (index >= 0 && index < songs.length) {
      setCurrentIndex(index);
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
    volume, // 👈 return current value
    bass,   // 👈 return current value
    audioEl: audioRef.current,
  };
}
