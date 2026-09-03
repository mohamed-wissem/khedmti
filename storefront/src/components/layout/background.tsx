import { Embers } from "./embers";
import { FrameAnimation } from "./frame-animation";

/**
 * Full-screen frame animation with atmospheric overlay layers.
 */
export function Background() {
  return (
    <div className="bf-bg" aria-hidden="true">
      <div className="absolute inset-0 bg-black" />
      <FrameAnimation />
      <div className="bf-eclipse" />
      <div className="bf-fog" />
      <Embers />
    </div>
  );
}
