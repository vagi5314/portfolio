"use client";

type SettleState = {
  velocity: number;
  isSettled: boolean;
  isInMiddleBand: (el: Element) => boolean;
};

let lastY = 0;
let lastTime = 0;
let velocityEMA = 0;
let isSettled = true;
const subscribers = new Set<(s: SettleState) => void>();
let started = false;

const SETTLE_VELOCITY_THRESHOLD = 0.4;

function emit() {
  const state: SettleState = {
    velocity: velocityEMA,
    isSettled,
    isInMiddleBand,
  };
  subscribers.forEach((fn) => fn(state));
}

function isInMiddleBand(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return rect.top < vh * 0.7 && rect.bottom > vh * 0.3;
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastY = window.scrollY;
  lastTime = performance.now();
  const tick = (now: number) => {
    if (subscribers.size === 0) {
      started = false;
      return;
    }
    const y = window.scrollY;
    if (lastTime > 0) {
      const dt = now - lastTime;
      if (dt > 0) {
        const v = Math.abs(y - lastY) / dt;
        velocityEMA = velocityEMA * 0.7 + v * 0.3;
        const newSettled = velocityEMA < SETTLE_VELOCITY_THRESHOLD;
        if (newSettled !== isSettled) {
          isSettled = newSettled;
          emit();
        }
      }
    }
    lastY = y;
    lastTime = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function getLookGateState(): SettleState {
  return {
    velocity: velocityEMA,
    isSettled,
    isInMiddleBand,
  };
}

export function subscribeLookGate(fn: (s: SettleState) => void): () => void {
  start();
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
