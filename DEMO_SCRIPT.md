# Voyager — Demo & Pitch Script

Event: Checkout — The Travel & Hospitality Hackathon (NYC). Track: **AI trip
planning**. Full sponsor/judge/prize reference: see the info packet you have —
this file just distills what to actually say on stage.

## Pitch (45 seconds, before the demo)
"Every hotel search tool is a one-shot search box built for consumers clicking
filters. But a real advisor call is a negotiation: 'Miami under $300' -> 'too far
from the beach' -> 'cheaper 4-star'. Voyager is the first voice copilot that
works that way — stateful, multi-turn, hands-free — and it proactively tells
the advisor when the same room is cheaper on another supplier. Built on
ElevenLabs Conversational AI and Stay22."

Most "AI trip planning" submissions will be consumer-facing chat assistants —
name the B2B angle explicitly: this is a copilot *for a travel advisor*, not a
replacement for one.

## Demo flow (2–3 minutes)
1. Start call. Wait for the greeting.
2. "Find me a family-friendly hotel in Miami under $300 a night for March 15 to 18."
3. Let it speak; point at the cards. If a callout fired, read it aloud:
   "Same room, $X cheaper on Hotels.com — that link is highlighted."
4. THE MONEY MOMENT: "Too far from the beach." -> watch results re-rank live.
5. "Any cheaper 4-star options?" -> second refinement stacks, earlier turn dims.
6. Invite a judge: "Give me any refinement right now — unscripted."

## Prize hooks — say these out loud, in these words

- **Anecdote Travel ($800)** — their exact criteria: *"the team with the best
  project that makes life easier for human or agentic travel advisors."* Say
  it back almost verbatim: "Voyager makes a human travel advisor's job
  faster — multi-turn state plus cross-supplier savings calls they'd
  otherwise miss." Their founder (Shrey Gupta, judging) runs an "AI + human"
  travel agency — same philosophy as Voyager: augment the advisor, don't
  replace them. Say that alignment out loud, don't leave it implicit.
- **ElevenLabs — "Winning Team" and "Best Built w/ ElevenLabs"** (two
  separate categories, both in play): the entire interaction runs on
  Conversational AI — streaming STT, real multi-turn tool calling with a
  full JSON-schema tool, streaming TTS. Not a wrapper around a single
  API call.
- **Compliance, unprompted**: "Live query-in, live-display-out, nothing
  persisted — that's Stay22's own usage restriction, and we built to it
  from day one." Several judges are Stay22-adjacent; naming this before
  they ask reads as rigor, not a talking point invented for the pitch.

## If asked "what's next" (closing beat or Q&A)

"Every turn already produces the exact labeled data a fine-tuning run would
need: the advisor's raw request, what the agent extracted as tool
parameters, and the real Stay22 result. Next is a self-scoring layer on top
of that: heuristics first (did we extract the right location, dates, and
budget, did the agent ever speak without a real tool result, how many turns
to satisfy the advisor), then an LLM-as-judge layer scoring intent-capture
accuracy per turn. Once enough scored conversations exist, that becomes the
training set for a travel-advisor-specialized voice model, instead of a
generic LLM plus a tool call. We didn't build the eval layer tonight, we
built the product it would learn from." Full architecture in the README
Roadmap section if anyone wants detail.

## If a judge asks: "why not Stay22's MCP server / prebuilt agent skill?"

Have this ready, don't get caught flat: Stay22 offers a prebuilt agent skill
for quick integration, but a raw passthrough wouldn't give us cross-supplier
savings callouts, multi-turn refine-vs-new-search session state, or the
date-sanity correction we added — all of which live in our own backend. The
custom layer is a feature, not a shortcut we skipped.

## Pre-event checklist
- [ ] Real Stay22 API key installed (demo mode = 5 req/min, too slow for rehearsal)
- [ ] Agent created via `node scripts/create-agent.mjs`; confirm it printed
      `Tool ready:` + `Updated agent`/`Created agent:` + `Attached tool_ids:`
- [ ] One full happy-path call completed the day before, with the browser
      console open — confirm `[voyager] CLIENT TOOL FIRED` actually logs
- [ ] Latency verified: each turn should feel like 3–5 seconds
- [ ] Phone hotspot tested as backup internet
- [ ] Backup: screen recording of a successful run, in case venue wifi dies
- [ ] Known-good fallback query: Miami, under $300, March 15–18 2027
- [ ] Checked luma.com/travel-hack-nyc for any submission requirement (video,
      writeup, deadline) not covered by the sponsor info packet

## If things break on stage
- 429s -> pause 60 seconds, speak about the architecture meanwhile.
- Agent talks but never calls the tool (no `CLIENT TOOL FIRED` in console,
  or it starts inventing hotel names) -> this is an agent-config issue, not
  something to fix live. Rerun `node scripts/create-agent.mjs` beforehand,
  never mid-demo.
- No internet -> play the backup clip; narrate the architecture over it.

## Compliance flex (if judges ask about data)
"Live query-in, live-display-out — we keep nothing. Session state is in-memory
per conversation, cleared on end. That's Stay22's usage model and we built to it."
