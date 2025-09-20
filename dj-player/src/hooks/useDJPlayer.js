import { useEffect, useRef, useState } from "react";

export function useDJPlayer(songs) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nightcore, setNightcore] = useState(false);

  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const bassRef = useRef(null);

  useEffect(() => {
    // only once on mount
    ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();

    // make the <audio> element once
    audioRef.current = new Audio(songs[0]);
    audioRef.current.crossOrigin = "anonymous";

    // connect it to Web Audio graph
    const source = ctxRef.current.createMediaElementSource(audioRef.current);

    gainRef.current = ctxRef.current.createGain();
    bassRef.current = ctxRef.current.createBiquadFilter();
    bassRef.current.type = "lowshelf";
    bassRef.current.frequency.value = 200;

    source.connect(bassRef.current).connect(gainRef.current).connect(ctxRef.current.destination);
  }, []); // 👈 important: empty array, run once only

  const play = () => {
    if (!audioRef.current) return;
    ctxRef.current.resume(); // needed on first user gesture
    audioRef.current.play();
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
    if (!audioRef.current) return;
    const next = (index + 1) % songs.length;
    setIndex(next);
    audioRef.current.src = songs[next];
    audioRef.current.play();
    setIsPlaying(true);
  };

  const setVolume = (v) => {
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  const upBass = (amount) => {
    if (bassRef.current) bassRef.current.gain.value = amount;
  };

  const toggleNightcore = () => {
    if (!audioRef.current) return;
    const newVal = !nightcore;
    setNightcore(newVal);
    audioRef.current.playbackRate = newVal ? 1.25 : 1.0;
  };

  return {
    play,
    pause,
    stop,
    nextSong,
    setVolume,
    upBass,
    toggleNightcore,
    isPlaying,
    nightcore,
    audioEl: audioRef.current,
  };
}
