import { create } from 'zustand';

interface PlayerState {
    isPlaying: boolean;
    volume: number;
    currentTitle: string;
    streamUrl: string;
    isPureRadio: boolean;
    fondoPlayerUrl: string | null;
    setPlaying: (isPlaying: boolean) => void;
    setVolume: (volume: number) => void;
    setTitle: (title: string) => void;
    setStreamUrl: (url: string) => void;
    setIsPureRadio: (val: boolean) => void;
    setFondoPlayerUrl: (url: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    isPlaying: false,
    volume: 0.8,
    currentTitle: 'ONRADIO - Transmisión en Vivo',
    streamUrl: 'https://stream.zeno.fm/1xvaxymzz3quv',
    isPureRadio: false,
    fondoPlayerUrl: null,

    setPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),
    setTitle: (currentTitle) => set({ currentTitle }),
    setStreamUrl: (streamUrl) => set({ streamUrl }),
    setIsPureRadio: (isPureRadio) => set({ isPureRadio }),
    setFondoPlayerUrl: (fondoPlayerUrl) => set({ fondoPlayerUrl }),
}));
