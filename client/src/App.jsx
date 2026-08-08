import { useEffect, useMemo, useRef, useState } from 'react';
import { useVoyagerAgent } from './hooks/useVoyagerAgent';
import ResultCard from './components/ResultCard';
import VoiceOrb from './components/VoiceOrb';

const STATUS_LABEL = {
  idle: 'Tap to start',
  connecting: 'Connecting…',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  connected: 'Ready — go ahead',
};

/** Map the raw SDK/connection state to the single state the orb renders. */
function useOrbState(connStatus, agentStatus) {
  return useMemo(() => {
    if (connStatus === 'off') return 'idle';
    if (connStatus === 'connecting') return 'connecting';
    if (['listening', 'speaking', 'thinking'].includes(agentStatus)) return agentStatus;
    return 'connected';
  }, [connStatus, agentStatus]);
}

export default function App() {
  const { connStatus, agentStatus, transcript, turns, error, start, stop, hasAgent } =
    useVoyagerAgent();
  const inCall = connStatus === 'connected' || connStatus === 'connecting';
  const orbState = useOrbState(connStatus, agentStatus);
  const [showTranscript, setShowTranscript] = useState(false);

  const resultsRef = useRef(null);
  const transcriptRef = useRef(null);
  useEffect(() => {
    resultsRef.current?.scrollTo({ top: resultsRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);
  useEffect(() => {
    if (showTranscript) transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
  }, [transcript, showTranscript]);

  const lastCaption = transcript[transcript.length - 1];

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="brand-mark">✈️</span> Voyager
        </div>
        <div className="brand-sub">AI voice copilot for travel advisors</div>
      </header>

      {!hasAgent && (
        <div className="banner">
          Create your agent with <code>node scripts/create-agent.mjs</code>, then put its ID in{' '}
          <code>client/.env</code> as <code>VITE_ELEVENLABS_AGENT_ID</code> and restart Vite.
        </div>
      )}
      {error && <div className="banner error">⚠️ {error}</div>}

      <section className="stage">
        <VoiceOrb state={orbState} />
        <div className="stage-status">{STATUS_LABEL[orbState] ?? 'Ready'}</div>

        <div className="caption-slot">
          {lastCaption ? (
            <p key={lastCaption.id} className={`caption caption-${lastCaption.role}`}>
              {lastCaption.text}
            </p>
          ) : (
            <p className="caption caption-hint">
              {inCall
                ? 'Try “Find me a hotel in Miami under $300 a night for September 15 to 18.”'
                : 'Start a call and talk like a travel advisor — hands-free.'}
            </p>
          )}
        </div>

        <div className="stage-controls">
          {!inCall ? (
            <button className="btn primary big" disabled={!hasAgent} onClick={start}>
              {hasAgent ? 'Start call' : 'Missing VITE_ELEVENLABS_AGENT_ID'}
            </button>
          ) : (
            <button className="btn danger big" onClick={stop}>
              End call
            </button>
          )}
          {transcript.length > 0 && (
            <button className="btn ghost" onClick={() => setShowTranscript((v) => !v)}>
              {showTranscript ? 'Hide' : 'Show'} conversation ({transcript.length})
            </button>
          )}
        </div>

        {showTranscript && (
          <div className="transcript-drawer scroll" ref={transcriptRef}>
            {transcript.map((m) => (
              <div key={m.id} className={`bubble ${m.role}`}>
                <span>{m.role === 'user' ? 'Advisor' : 'Voyager'}</span>
                {m.text}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="results-stage">
        <div className="results-head">
          <h2>Search results</h2>
          {turns.length > 0 && (
            <span className="results-sub">Newest highlighted · refinements stack below</span>
          )}
        </div>

        <div className="results-scroll scroll" ref={resultsRef}>
          {turns.length === 0 && (
            <div className="empty">
              Results appear here as you talk. Each refinement stacks a new turn on top — watch
              the negotiation happen, just like a real advisor call.
            </div>
          )}
          {turns.map((turn) => (
            <div key={turn.id} className={`turn ${turn.dimmed ? 'dimmed' : 'active'}`}>
              <div className="turn-head">
                <span className="turn-label">
                  {turn.dimmed ? 'Earlier' : 'Current'} ·{' '}
                  {turn.ok ? (turn.turn === 'new' ? 'New search' : 'Refinement') : 'Problem'}
                </span>
                {turn.userText && <span className="turn-user">“{turn.userText}”</span>}
              </div>

              {!turn.ok && <div className="error-note">⚠️ {turn.error?.spoken || turn.error?.message}</div>}

              {turn.ok && (
                <>
                  {turn.callouts?.length > 0 && (
                    <div className="callouts">
                      {turn.callouts.map((c, i) => (
                        <div key={i} className="callout">
                          ⚡ <b>${c.saveAmount} cheaper on {c.bestLabel}</b> than {c.worstLabel} —{' '}
                          {c.propertyName}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="cards">
                    {(turn.cards || []).map((c) => (
                      <ResultCard key={c.id} card={c} nights={turn.meta?.nights} />
                    ))}
                  </div>
                  {turn.cards?.length === 0 && (
                    <div className="empty small">No matches — try widening the filters.</div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
