import { useEffect, useRef, useState } from "react";

export function useDJPlayer(songs) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nightcore, setNightcore] = useState(false);

  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const bassRef = useRef(null);
  const sourceRef = useRef(null);

  // initialize audio context + graph once
  useEffect(() => {
  ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();

  // create one <audio> element
  audioRef.current = new Audio();
  audioRef.current.crossOrigin = "anonymous";
  audioRef.current.muted = true;  // prevent double playback

  // create one source node
  sourceRef.current = ctxRef.current.createMediaElementSource(audioRef.current);

  gainRef.current = ctxRef.current.createGain();
  bassRef.current = ctxRef.current.createBiquadFilter();
  bassRef.current.type = "lowshelf";
  bassRef.current.frequency.value = 200;

  sourceRef.current
    .connect(bassRef.current)
    .connect(gainRef.current)
    .connect(ctxRef.current.destination);
}, []);


  // update audio src whenever playlist/index changes
  useEffect(() => {
    if (songs.length === 0 || !audioRef.current) return;
    audioRef.current.src = songs[index];
    if (isPlaying) {
      audioRef.current.play();
    }
  }, [songs, index, isPlaying]);

  const play = () => {
    if (!audioRef.current) return;
    ctxRef.current.resume(); // unlock audio context
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
    if (songs.length === 0) return;
    setIndex((prev) => (prev + 1) % songs.length);
  };

  // Play a specific song by index (useful for adding a song and immediately playing it)
  const playSongAt = (i) => {
    if (!audioRef.current || !ctxRef.current) return;
    if (i < 0 || i >= songs.length) return;
    setIndex(i);
    ctxRef.current.resume();
    audioRef.current.play();
    setIsPlaying(true);
  };

  const setVolume = (v) => {
    if (gainRef.current) gainRef.current.gain.value = v;
  };

  const setBass = (amount) => {
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
  playSongAt,
    setVolume,
    setBass,
    toggleNightcore,
    isPlaying,
    nightcore,
    audioEl: audioRef.current,
  };
}
