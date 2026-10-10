type Listener = (detached: boolean) => void;

const listeners = new Set<Listener>();

export const scrollStarStore = {
  home: { x: 0, y: 0, size: 0, valid: false },
  detached: false,

  setDetached(value: boolean) {
    if (this.detached === value) return;
    this.detached = value;
    listeners.forEach((listener) => listener(value));
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const CANVAS_STAR_PX = 37;

export const SCROLL_STAR_COLOR = "#1d86bf";
