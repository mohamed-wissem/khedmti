import { Embers } from "./embers";

/**
 * Dynamic background system v1.
 * CSS-only fog + eclipse (cheap, compositor-only) plus a capped ember particle
 * canvas (client, intersection/visibility-gated). Heavier WebGL hero comes later.
 */
export function Background() {
  return (
    <div className="bf-bg" aria-hidden="true">
      <div className="bf-eclipse" />
      <div className="bf-fog" />
      <Embers />
    </div>
  );
}
