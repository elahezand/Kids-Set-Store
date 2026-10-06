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

/** on-screen size (px) of the star drawn by StarCanvas inside the SIZE box — used to match the hero's star */
export const CANVAS_STAR_PX = 37;

/** the hero's star that leaves on scroll (same color as STARS[0] in heroScene — PALETTE.sky) */
export const SCROLL_STAR_COLOR = "#0f71c2";
