import gameArt from "../../games.json";

const GAME_ART = gameArt as Record<string, string>;
const FALLBACK_ART =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";

export function getGameArt(seed: string, fallback = FALLBACK_ART) {
  const keys = Object.keys(GAME_ART);
  if (!keys.length) return fallback;

  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  const key = keys[hash % keys.length];
  return GAME_ART[key] ?? fallback;
}
