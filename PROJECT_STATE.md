# PROJECT_STATE.md

## Project

Working title: Music Timeline Game

Status: Research and architecture phase

Last major decision: Initial technical architecture defined.

---

## 1. Product Summary

The project is a multiplayer browser game inspired by Hitster's chronological music-placement mechanic.

Players listen to a hidden song and place its card into a personal or shared chronological timeline.

After confirming the position:

- the song is revealed
- the server checks whether the placement is correct
- a correct placement awards one point
- an incorrect placement awards no point
- an incorrectly placed card animates automatically to its correct position
- the turn passes to the next player

The visual target is a polished online card-game experience similar to the physical-feeling card movement found in digital UNO-style games.

---

## 2. Current Project Phase

Current phase:

```text
RESEARCH / ARCHITECTURE
```

No final implementation has been selected beyond the architecture documented below.

The next development milestone should be a card-physics prototype using fake song data.

---

## 3. Agreed Technology Stack

### Frontend

```text
React
TypeScript
Vite
Tailwind CSS
Motion for React
dnd-kit
Zustand when needed
```

### Backend

```text
Node.js
TypeScript
Express
Socket.IO
```

### Data

Initial:

```text
JSON
in-memory game rooms
```

Later if persistence is needed:

```text
SQLite
```

### Public local access

```text
ngrok
```

---

## 4. Why This Stack Was Selected

React fits the project because the game requires:

- many interactive UI states
- animated cards
- timelines
- drag and drop
- responsive game screens
- reusable game components

TypeScript is used throughout the project so frontend and backend can share domain types.

Node.js and Socket.IO were selected because the game requires:

- low-latency multiplayer communication
- room-based sessions
- turn synchronization
- server-authoritative state
- typed real-time events

Motion and dnd-kit have separate responsibilities:

```text
dnd-kit = drag/drop behavior and placement logic
Motion  = animation and physical feeling
```

---

## 5. Core Gameplay Flow

Current intended round flow:

```text
LOBBY
  ↓
STARTING
  ↓
DRAWING_CARD
  ↓
LISTENING
  ↓
PLACING_CARD
  ↓
CONFIRMING
  ↓
REVEALING
  ↓
RESOLVING
  ↓
NEXT_PLAYER
```

Possible final phase:

```text
FINISHED
```

---

## 6. Turn Rules

Current rules:

1. The server chooses the hidden song.
2. The active player listens to the song.
3. The active player drags the card to a position in their timeline.
4. The active player confirms the selected position.
5. The server validates the position.
6. The song is revealed.
7. Correct placement:
   - +1 point
   - card remains in selected location
8. Incorrect placement:
   - +0 points
   - card moves automatically to the correct chronological position
9. Next player's turn begins.

The server is authoritative.

---

## 7. Scoring

Current rule:

```text
Correct placement = +1 point
Incorrect placement = +0 points
```

No alternative scoring system has been approved yet.

---

## 8. Timeline Ordering Rule

Current intended chronological key:

```text
releaseYear
```

Songs are selected from Billboard Year-End charts, but their placement in the timeline is based on release year.

This distinction exists because:

```text
releaseYear
```

and:

```text
billboardYear
```

are not always equal.

Equal release years must be supported.

---

## 9. Song Catalog

Target source concept:

```text
Billboard Year-End Hot 100
```

Selection rule:

```text
Top 10 songs for each year
```

Range:

```text
1960 through 2024 inclusive
```

Expected catalog size:

```text
65 years × 10 songs = 650 songs
```

The runtime game should use a local curated dataset instead of requesting Billboard data during each match.

---

## 10. Planned Song Model

Current proposed model:

```ts
interface Song {
  id: string;

  title: string;
  artist: string;

  releaseYear: number;

  billboardYear: number;
  billboardRank: number;

  coverUrl?: string;

  spotifyId?: string;
  appleMusicId?: string;
  youtubeId?: string;

  localAudioPath?: string;
}
```

Status:

```text
PROPOSED
```

Not yet implemented.

---

## 11. Music Playback Research

Music playback is currently the largest unresolved external dependency.

### Spotify

Pros:

- strong browser playback experience
- official Web Playback SDK
- good playback control

Known constraints:

- Web Playback SDK requires Spotify Premium
- 30-second preview URLs should not be treated as reliable
- deprecated preview behavior exists
- provider usage policies must be respected

Status:

```text
CANDIDATE
```

Not selected.

### Apple Music

Pros:

- MusicKit for browser playback
- catalog APIs
- strong official platform

Known constraints:

- playback may depend on subscription/account capabilities
- provider requirements must be respected

Status:

```text
CANDIDATE
```

Not selected.

### YouTube

Pros:

- broad catalog
- official IFrame Player API
- strong browser support

Problems:

- player visibility and provider policy requirements
- metadata may reveal the answer
- undesirable dependency on visible YouTube UI for hidden-song gameplay

Status:

```text
NOT PREFERRED FOR FINAL GAMEPLAY
```

May still be useful for experiments.

### Legacy iTunes previews

Problem:

Apple's promotional-preview terms are not a good fit for using preview content as the entertainment mechanism of a game.

Status:

```text
DO NOT USE AS CORE GAME AUDIO SOLUTION
```

---

## 12. Music Abstraction Decision

Approved architecture:

```ts
interface MusicProvider {
  load(song: Song): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  stop(): void;
}
```

Planned implementations may include:

```text
LocalMusicProvider
SpotifyMusicProvider
AppleMusicProvider
YouTubeMusicProvider
```

The rest of the game must depend on `MusicProvider`, not directly on a provider SDK.

For development, use legal local or royalty-free test audio.

Status:

```text
ARCHITECTURAL DECISION APPROVED
```

---

## 13. Multiplayer Design

Socket.IO is the intended real-time transport.

Each match should be isolated using a Socket.IO room.

Example room code:

```text
X7K2A
```

Conceptual structure:

```text
GameRoom
  id
  host
  players
  currentPlayer
  gameState
```

The server owns:

- room membership
- turn order
- scores
- selected song
- round state
- validation
- reveal timing
- next-turn transition

---

## 14. Planned Socket Events

Proposed client-to-server events:

```text
room:create
room:join
room:leave
game:start
song:play-request
song:pause-request
card:placement-submit
turn:ready
```

Proposed server-to-client events:

```text
room:state
game:started
round:started
song:play
song:pause
card:placement-result
card:revealed
score:updated
turn:changed
game:finished
error
```

Status:

```text
PROPOSED
```

Event names may be refined during implementation.

---

## 15. Hidden-Answer Strategy

The client should not receive the complete unrevealed song answer before validation.

Before reveal, the browser should only receive the minimum information necessary to render the round.

After confirmation, the server sends the revealed metadata.

Reason:

Avoid making the answer trivially visible in React state or normal browser inspection.

Status:

```text
APPROVED PRINCIPLE
```

---

## 16. Card Interaction Design

The intended interaction is not standard browser drag-and-drop.

dnd-kit should handle:

- drag sensors
- drop areas
- timeline insertion
- sortable logic
- touch input

Motion should handle:

- lift
- scale
- rotation
- shadow
- spring movement
- automatic reordering
- card flips
- result feedback
- turn transitions

Status:

```text
ARCHITECTURAL DECISION APPROVED
```

---

## 17. Incorrect Placement Animation

Required behavior:

```text
player-selected position
        ↓
card revealed
        ↓
incorrect feedback
        ↓
card lifts
        ↓
card slides to authoritative position
        ↓
neighbor cards animate
        ↓
card snaps into place
```

The incorrect card should not simply teleport to its correct location.

Status:

```text
CORE UX REQUIREMENT
```

---

## 18. Correct Placement Animation

Current intended sequence:

```text
confirmation
    ↓
reveal
    ↓
correct feedback
    ↓
+1 score animation
    ↓
card settles
```

Status:

```text
CORE UX REQUIREMENT
```

---

## 19. Card Reveal

Preferred visual:

```text
3D card flip
```

Hidden face should not reveal:

- title
- artist
- year

Revealed face should prominently display:

- song title
- artist
- year

Status:

```text
PLANNED
```

---

## 20. Accessibility Requirements

The game should support:

- desktop pointer input
- touch screens
- keyboard-focusable controls
- visible focus state
- readable labels
- reduced-motion preferences

Important actions must not rely solely on icon meaning.

Status:

```text
REQUIRED
```

---

## 21. ngrok Deployment Plan

Preferred local production-like setup:

```text
localhost:3000
```

Node.js should serve:

```text
React production build
Socket.IO
optional HTTP API
```

Then expose:

```bash
ngrok http 3000
```

Advantages:

- one tunnel
- one public origin
- HTTPS
- WebSocket support
- simpler mobile testing

Status:

```text
PLANNED
```

---

## 22. Planned Repository Structure

```text
music-timeline/
  client/
    src/
      components/
        Card/
        Timeline/
        Deck/
        PlayerBar/
        Scoreboard/
      pages/
        Home.tsx
        Lobby.tsx
        Game.tsx
      hooks/
      store/
      socket/
      music/

  server/
    src/
      game/
        Game.ts
        GameRoom.ts
        GameEngine.ts
        validatePlacement.ts
      socket/
      music/
      server.ts

  shared/
    Song.ts
    Player.ts
    GameState.ts
    SocketEvents.ts

  data/
    billboard.json

  AGENTS.md
  PROJECT_STATE.md
```

Status:

```text
PROPOSED
```

May evolve during implementation.

---

## 23. Architecture Overview

```text
                        INTERNET
                            |
                          ngrok
                            |
                            v
                +---------------------+
                | Node.js + TypeScript|
                | Express + Socket.IO |
                +----------+----------+
                           |
               +-----------+-----------+
               |                       |
               v                       v
        Game Engine               React Build
               |
        +------+------+
        |             |
        v             v
   Game Rooms      Song Catalog
                   JSON / SQLite

                 Socket.IO

        +-----------+-----------+
        |           |           |
        v           v           v
     Browser     Browser      Mobile
```

---

## 24. MVP Roadmap

### Phase 0 — Card Physics

Goal:

Prove that the card interaction feels good.

Implement:

- fake timeline
- draggable hidden card
- insertion gaps
- animated neighboring cards
- card flip
- auto-move to correct slot
- desktop and touch behavior

Backend:

```text
NOT REQUIRED
```

Music:

```text
NOT REQUIRED
```

Status:

```text
NEXT PHASE
```

---

### Phase 1 — Local Game Rules

Implement:

- mock song deck
- draw card
- select placement
- confirm placement
- validate year
- correct result
- incorrect result
- score
- next turn

Status:

```text
NOT STARTED
```

---

### Phase 2 — Multiplayer

Implement:

- Node server
- Socket.IO
- room creation
- room join
- player list
- turn state
- score synchronization
- authoritative placement validation

Status:

```text
NOT STARTED
```

---

### Phase 3 — ngrok

Test:

- same-machine multiple tabs
- laptop + phone
- multiple browsers
- disconnect handling
- WebSocket reliability

Status:

```text
NOT STARTED
```

---

### Phase 4 — Audio Layer

Implement:

```text
MusicProvider
LocalMusicProvider
```

Then evaluate external provider integration.

Status:

```text
NOT STARTED
```

---

### Phase 5 — Billboard Dataset

Build and verify:

```text
1960–2024
Top 10 Year-End songs
```

Target:

```text
650 catalog entries
```

Add provider identifiers where available.

Status:

```text
NOT STARTED
```

---

### Phase 6 — Polish

Focus:

- physical-feeling card animation
- mobile responsiveness
- visual identity
- deck animations
- turn transitions
- result animations
- sound effects
- reduced-motion support

Status:

```text
NOT STARTED
```

---

## 25. Explicit Non-Goals for the MVP

Currently excluded:

```text
Next.js
Django
FastAPI
PostgreSQL
MySQL
MongoDB
Redis
Prisma
Docker
Kubernetes
GraphQL
WebRTC
Redux
microservices
full user account system
complex authentication
```

These technologies are not permanently forbidden.

They should only be introduced if later requirements justify them.

---

## 26. Important Open Questions

The following items remain unresolved.

### Music provider

Which provider will be used for the final playable catalog?

Candidates:

- Spotify
- Apple Music
- another properly licensed source

### Playback topology

Possible options:

```text
host-only playback
```

or:

```text
every client plays synchronized audio
```

Host-only playback is currently the simpler direction.

### Match objective

Not yet decided:

- first player to N points
- fixed number of rounds
- complete deck subset
- configurable win condition

### Timeline ownership

Not yet finalized:

- each player has a personal timeline
- all players share one timeline

The original concept appears compatible with player-specific timelines, but this must be explicitly decided before implementing final rules.

### Starting cards

Not yet decided:

- zero starting cards
- one random revealed starting card
- multiple starting cards

### Duplicate years

Validation behavior for equal release years needs a finalized implementation rule, although non-decreasing chronological order is the current recommendation.

### Reconnection

Multiplayer reconnection behavior has not yet been designed.

---

## 27. Immediate Next Step

Build Phase 0.

Use fake songs and fake years.

Recommended example dataset:

```ts
[
  { id: "a", title: "Mock A", releaseYear: 1965 },
  { id: "b", title: "Mock B", releaseYear: 1977 },
  { id: "c", title: "Mock C", releaseYear: 1986 },
  { id: "d", title: "Mock D", releaseYear: 1998 },
  { id: "e", title: "Mock E", releaseYear: 2014 }
]
```

The prototype should prove:

- card pickup feels physical
- insertion gap is clear
- timeline cards move smoothly
- dropping is predictable
- incorrect cards can animate to another position
- card flip works
- touch interaction is viable

Do not integrate Spotify, Apple Music, Billboard data, authentication, or persistence before this prototype proves the main interaction.

---

## 28. Current Decision Summary

Approved:

```text
React
TypeScript
Vite
Tailwind
Motion
dnd-kit
Node.js
Express
Socket.IO
ngrok
server-authoritative game logic
MusicProvider abstraction
local test audio during development
Billboard Top 10 Year-End catalog concept
1960–2024 range
releaseYear timeline ordering
```

Not selected yet:

```text
final music provider
final database requirement
win condition
starting-card rule
timeline ownership model
reconnection behavior
final visual identity
```

Not started:

```text
codebase
multiplayer
catalog import
music integration
ngrok testing
production build
```

---

## 29. Documentation Rule

This file must be updated whenever actual project reality changes.

Do not mark a feature as completed merely because it is planned.

Use status labels such as:

```text
PROPOSED
PLANNED
IN PROGRESS
BLOCKED
APPROVED
COMPLETED
```

Keep `AGENTS.md` as the rules document.

Keep `PROJECT_STATE.md` as the factual snapshot of the project's current state.
