# VOYAGER — AI Voice Copilot for Travel Advisors

Real-time voice copilot that searches live hotel inventory across Booking.com,
Expedia, Hotels.com and VRBO through natural multi-turn conversation.

This is **voyager_2** — a clean rebuild of the original hackathon project.
The code here already has every bug we hit in v1 fixed *before* you start,
so setup should be config-only (your two API keys), not debugging.

## Architecture

React client <-> (WebSocket audio) <-> ElevenLabs Conversational AI agent
-> client tool call -> Node/Express backend (session state + callouts + summary)
-> Stay22 /v2/accommodations -> spoken summary back through the agent.

Compliance: in-memory session state only. No persistence, no analytics —
live query-in, live-display-out, per Stay22 terms.

## What's different from v1 (read this once)

Everything below was a real bug that cost real time in v1. Fixed here from
the start:

1. **`clientTools` shape.** `@elevenlabs/client`'s `Conversation.startSession`
   wants `clientTools` as a plain object: `{ toolName: (parameters) => result }`.
   It does a `hasOwnProperty` check on that object — pass an array instead and
   the tool silently never fires, with no error anywhere. See the comment in
   [`client/src/hooks/useVoyagerAgent.js`](client/src/hooks/useVoyagerAgent.js).
2. **`onMessage` payload shape.** The SDK calls back with
   `{ source, role, message, event_id }` where `message` is a plain string —
   not a nested `{ type, text }` object.
3. **Agent tool registration.** Tools are standalone resources
   (`POST/PATCH /v1/convai/tools`), attached to an agent via
   `conversation_config.agent.prompt.tool_ids`. The old inline
   `agent.prompt.tools` / `platform_settings.tools` field is deprecated and
   **rejected** by the API — but a request containing it can still return 200,
   so the failure is silent: the agent just never has the tool attached, and
   will either stall ("still searching...") or hallucinate plausible-sounding
   fake hotel names instead of your real Stay22 data. See
   [`scripts/create-agent.mjs`](scripts/create-agent.mjs).
4. **`expect_reply` vs `expects_response`.** The correct field on the tool
   config is `expects_response`; it blocks the conversation until your client
   actually returns a result.
5. **Vite/plugin-react version pin.** `client/package.json` pins
   `@vitejs/plugin-react@^6.0.5` to match `vite@^8.2.1` — the default
   `^4.3.1` conflicts with Vite 8's peer dependency range and `npm install`
   fails outright with `ERESOLVE` on a fresh clone.
6. **No hardcoded fallback agent ID.** v1's `client/src/config.js` silently
   fell back to a hardcoded demo agent ID when `VITE_ELEVENLABS_AGENT_ID` was
   unset, which caused confusion testing against an agent nobody had actually
   configured. Here, an unset agent ID just disables the Start Call button.
7. **Dropped the unused `@elevenlabs/react` dependency** — the app uses
   `@elevenlabs/client` directly; the other package was dead weight.

## Two-phase build (as requested)

**Phase 1 — prove the core loop works, no UI polish needed.** Backend +
Stay22 + ElevenLabs agent + tool call, verified via terminal and browser
console logs. This is steps 1–6 below.

**Phase 2 — the UI.** Already built and included (`client/src/App.jsx`,
`ResultCard.jsx`) — dark-mode call transcript + stacked search-turn cards
with cross-supplier savings callouts. Once Phase 1 works, it just renders.

## Setup

### 1. Backend

```bash
cd server
npm install
copy .env.example .env
```
Edit `server/.env` and set `STAY22_API_KEY` (get one at hub.stay22.com ->
Settings -> API). You can leave it blank to smoke-test in demo mode first
(5 req/min by IP — fine for one check, not for rehearsal).

```bash
npm run dev
```
Expect: `Voyager backend running on http://localhost:8787`

### 2. Smoke-test the backend alone (no ElevenLabs needed yet)

New terminal:
```bash
cd server
node test-search.mjs
```
Expect `ok: true` and a few real hotel names/prices printed. **Don't move on
until this works** — it isolates the Stay22 integration from everything else.

### 3. Create the ElevenLabs agent + tool

Get a real API key: elevenlabs.io -> profile icon -> **API Keys** -> **Create
Key**. It must:
- Start with `sk_` and be shown to you at creation time (the masked table
  value and any "key ID" elsewhere are **not** usable here).
- Have the **ElevenAgents** permission set to **Write** (Restrict Key -> ON,
  ElevenAgents -> Write, everything else No Access is fine — least privilege).

```bash
cd ..
$env:ELEVENLABS_API_KEY="sk_your_real_key"
node scripts/create-agent.mjs
```
Expect it to end with:
```
Tool ready: tool_xxxxxxxx
Created agent: agent_xxxxxxxx
Attached tool_ids: [tool_xxxxxxxx]
```
Copy the agent ID. To update the same agent later instead of creating a new
one, also set `$env:AGENT_ID="agent_xxxxxxxx"` before rerunning.

### 4. Frontend

```bash
cd client
npm install
copy .env.example .env
```
Edit `client/.env` and set `VITE_ELEVENLABS_AGENT_ID` to the ID from step 3.

```bash
npm run dev
```
Open `http://localhost:5173`.

### 5. Verify Phase 1 (the core loop)

Open the browser console before starting. Click **Start call**, allow the
mic, say: *"Find me a hotel in Miami under $300 a night for September 15 to
18."* Watch for, in order:
```
[voyager] CLIENT TOOL FIRED {mode: "new", address: "Miami, FL", ...}
[voyager] tool result sent to agent {ok: true, ...}
```
If `CLIENT TOOL FIRED` never appears, the tool isn't attached to this agent —
go back to step 3 and check its output.

### 6. Verify Phase 2 (the UI)

With Phase 1 confirmed, the **Search turns** panel should already be showing
hotel cards — no extra step needed, `App.jsx` renders straight off the same
state Phase 1 populates. Try a refinement ("only 4-star or better") and watch
a new turn stack on top with the previous one dimmed.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Agent talks fluently but invents hotel names/prices, `CLIENT TOOL FIRED` never logs | Tool isn't attached. Rerun `node scripts/create-agent.mjs`; verify in the dashboard: Agent -> Tools tab -> type Client, "Wait for response" ON. |
| Agent stalls ("still searching...") forever | Same as above. |
| `create-agent.mjs` fails with `401 invalid_api_key` / "API key ID used as API key" | You pasted a key ID, not the real secret. Go to API Keys -> Create Key, copy the `sk_...` value shown once at creation. |
| `create-agent.mjs` fails with `401 missing_permissions` / `convai_write` | Edit the key's permissions: **ElevenAgents -> Write**. |
| `create-agent.mjs` fails with `fetch failed` | Network-level failure (DNS/proxy/firewall), not an API error — check your connection; the script prints `.cause` detail on this specific error to help diagnose. |
| `CLIENT TOOL FIRED` logs but UI stays blank | Shouldn't happen with this codebase — if it does, check `client/src/hooks/useVoyagerAgent.js` still has `clientTools` as a plain object, not an array. |
| `npm install` fails with `ERESOLVE` in `client/` | Shouldn't happen — `package.json` already pins compatible `vite`/`@vitejs/plugin-react` versions. If it still does, check you didn't hand-edit those versions. |
| `git pull` / `create-agent.mjs` fails with `Could not resolve host` / DNS errors | Transient local network/DNS issue — retry. |
| `EADDRINUSE` on `node src/index.js` | A previous server instance is already running — reuse it, or find/stop it: `Get-NetTCPConnection -LocalPort 8787 \| Select OwningProcess` then `Stop-Process -Id <pid>`. |
| 429 errors from Stay22 | Demo mode (5 req/min). Set a real `STAY22_API_KEY` (150 req/min). |
| "couldn't reach backend" | Backend not running, or `VITE_BACKEND_URL` wrong. |
| No mic prompt | Chrome on localhost is a secure context — allow mic via the address-bar icon. |

## Verify before the event (spec requirement)

- ElevenLabs: client-tool config shape + `Conversation.startSession({ agentId })`
  against current docs (things move fast — re-check if anything above seems stale).
- Stay22: hit `/v2/accommodations` once with your real key; confirm rate headers.

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the pitch and demo flow.

## Roadmap: self-evaluation and adaptive learning

Not built. Documented here because the architecture to support it already
exists as a side effect of how the app works today, not as something
bolted on.

For every turn, the pieces of a labeled training example already exist
independently: the advisor's raw utterance (`transcript` in
`useVoyagerAgent.js`), what the agent extracted as tool parameters
(`CLIENT TOOL FIRED` payload), and the real Stay22 result the backend
returned. Nothing currently connects those three into a scored record.

Planned, in order of effort:

1. **Heuristic self-scoring — no new dependencies.** Per turn: did the
   extracted params actually cover what the advisor said (location, dates,
   budget present when mentioned)? Did the agent ever speak *before* a real
   tool result came back (hallucination risk)? Turn latency. Refinement-loop
   length (how many turns to satisfy the advisor — an efficiency signal).
   Computed and logged server-side per session; nothing here needs a new API
   key.
2. **LLM-as-judge.** A second, cheap model call per turn scoring
   intent-capture accuracy and flagging hallucinations more rigorously than
   heuristics can. Requires an Anthropic or OpenAI key.
3. **Fine-tuning loop.** Once enough scored conversations exist, use them to
   fine-tune a travel-advisor-specialized model, closing the loop from
   "generic LLM plus a tool call" to a model that has actually learned
   advisor conversation patterns.

None of this conflicts with Stay22's no-persistence restriction — it's
conversation-quality metadata about *our own agent*, not accommodation
listing data, so it's outside what that restriction covers.
