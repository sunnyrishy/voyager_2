// No hardcoded fallback agent ID here on purpose: voyager_1 silently fell back to a
// hardcoded demo agent ID when VITE_ELEVENLABS_AGENT_ID was unset, which caused a lot
// of confusion (testing against an agent that wasn't actually configured with the
// tool). Better to fail loudly via `hasAgent` in the UI until you set your own.
export const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';
