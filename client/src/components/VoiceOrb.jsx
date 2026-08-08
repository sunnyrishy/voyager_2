/**
 * A ChatGPT-voice-mode-style living orb, built from layered blurred
 * gradient blobs (pure CSS animation, no canvas/WebGL/audio analysis —
 * state-driven, not amplitude-driven, so it stays simple and cheap).
 *
 * `state` drives the visuals via a `data-state` attribute the CSS keys off:
 * idle | connecting | ready | listening | thinking | speaking
 */
export default function VoiceOrb({ state = 'idle', size = 'hero' }) {
  return (
    <div className={`orb-wrap orb-${size}`} data-state={state} aria-hidden="true">
      <span className="orb-ring r1" />
      <span className="orb-ring r2" />
      <span className="orb-ring r3" />
      <div className="orb-core">
        <span className="orb-blob b1" />
        <span className="orb-blob b2" />
        <span className="orb-blob b3" />
      </div>
    </div>
  );
}
