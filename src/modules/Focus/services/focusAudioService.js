// Architecture-ready, not wired to real playback (per the Phase 3 scope —
// no bundled audio assets exist, and adding real streaming/bundled audio is
// a substantial, separately-scoped effort). This defines the exact
// interface a real implementation (Web Audio API, most likely) would
// fulfill: a track catalog, a subscribable state object, and play/pause/
// setVolume actions. The FocusScreen UI is built against this interface
// now, so swapping in real playback later is a change inside this one
// file, not a UI rewrite.
const TRACK_CATALOG = [
  { id: 'rain', label: 'Rain', category: 'ambient', icon: 'rainy-outline' },
  { id: 'forest', label: 'Forest', category: 'ambient', icon: 'leaf-outline' },
  { id: 'white-noise', label: 'White Noise', category: 'ambient', icon: 'radio-outline' },
  { id: 'lofi', label: 'Lo-fi Focus', category: 'music', icon: 'musical-notes-outline' },
];

let state = { currentTrackId: null, isPlaying: false, volume: 0.7 };
let listeners = [];

function emit() {
  listeners.forEach((listener) => listener(state));
}

export const focusAudioService = {
  isPlaybackImplemented: false,

  getCatalog: () => TRACK_CATALOG,
  getState: () => state,

  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  async play(trackId) {
    // Real implementation would load + play the audio file/stream here
    // (e.g. a Web Audio API AudioBufferSourceNode or an <audio> element).
    state = { ...state, currentTrackId: trackId, isPlaying: true };
    emit();
  },

  async pause() {
    state = { ...state, isPlaying: false };
    emit();
  },

  async setVolume(volume) {
    state = { ...state, volume };
    emit();
  },
};
