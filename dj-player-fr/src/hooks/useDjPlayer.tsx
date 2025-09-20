import { useState, useRef, useEffect } from "react";

export function useDJPlayer(songs: string[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [volume, setVolume] = useState(75); // 0–100
  const [bass, setBass] = useState(50);
  const [nightcore, setNightcore] = useState(false);

  // initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // load new song when index changes
  // play/pause effect — runs whenever isPlaying flips
// effect to handle play/pause
useEffect(() => {
  if (!audioRef.current) return;
  const audio = audioRef.current;

  if (isPlaying) {
    if (songs[currentIndex]) {
      // always reset src first
      console.log("Setting src to:", songs[currentIndex]);
      audio.src = songs[currentIndex];

      // wait until the file is ready before calling play
      const handleCanPlay = () => {
        audio.play().catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Play failed:", err);
          }
        });
      };

      audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
      // cleanup in case index or state flips before it loads
      return () => {
        audio.removeEventListener("canplaythrough", handleCanPlay);
      };
    }
  } else {
    audio.pause();
  }
}, [isPlaying, currentIndex, songs]);


// load song when index changes
useEffect(() => {
  if (!audioRef.current || songs.length === 0) return;
  audioRef.current.src = songs[currentIndex];
}, [currentIndex, songs]);


  // apply volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // apply nightcore
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = nightcore ? 1.75 : 1.0;
    }
  }, [nightcore]);

  useEffect(() => {
    console.log("Bass set to", bass);
  }, [bass]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play().catch((err) => {
      if (err.name !== "AbortError") {
        console.error("Play failed:", err);
      }
    });
    setIsPlaying(true);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const nextSong = () => {
    if (songs.length > 0) {
      setCurrentIndex((i) => (i + 1) % songs.length);
    }
  };

  const playSongAt = (index: number) => {
    if (index >= 0 && index < songs.length) {
      setCurrentIndex(index);
      setIsPlaying(true); // triggers useEffect above → will wait for canplay
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
