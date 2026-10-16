# AGENTS.md

## Purpose

This file defines the implementation rules, architectural constraints, working conventions, and non-goals for the music timeline game project.

The project is a web-based multiplayer music game inspired by the timeline-placement mechanic of Hitster and the animated card handling of online UNO-style games.

Any developer or coding agent working in this repository must follow this document unless the project owner explicitly overrides a rule.

---

## 1. Product Goal

Build a multiplayer web game where players listen to a hidden song, drag a card into a chronological timeline, confirm its position, and receive points when the placement is correct.

Core turn flow:

1. The server selects a hidden song.
2. The active player can play or pause the song.
3. The player drags the hidden card into a position in their timeline.
4. The player confirms the placement.
5. The server validates the selected position.
6. The song title, artist, and year are revealed.
7. If correct:
   - The player receives one point.
   - The card remains in the chosen position.
8. If incorrect:
   - No point is awarded.
   - The card animates automatically to its correct chronological position.
9. The turn passes to the next player.

The final experience should feel like a game, not like a conventional CRUD web application.

---

## 2. Technology Decisions

### Frontend

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Motion for React
- dnd-kit
- Zustand when centralized client state is needed

Do not replace these technologies without a clear architectural reason.

### Backend

Use:

- Node.js
- TypeScript
- Express
- Socket.IO

The backend is authoritative for game state.

### Data

Initial phases may use:

- JSON for the song catalog
- In-memory game rooms

Later phases may use:

- SQLite for persistence

Do not introduce PostgreSQL, MySQL, Redis, Prisma, or another database layer unless the project requirements actually require them.

### Networking

The local production-like server should be exposable through:

- ngrok

The preferred final local topology is:

```text
Browser
   |
 HTTPS / WSS
   |
 ngrok
   |
 Node.js + Express + Socket.IO
   |
 React production build
```

Prefer serving the React production build from the Node.js server so a single ngrok tunnel is sufficient.

---

## 3. Language Rules

Use TypeScript for both frontend and backend.

Avoid introducing JavaScript files unless required by tooling.

Prefer strict typing.

Do not use `any` as a shortcut unless absolutely necessary.

Prefer explicit domain types such as:

```ts
Song
Player
GameRoom
GameState
TimelineCard
RoundState
GamePhase
ServerToClientEvents
ClientToServerEvents
```

Shared types should live in a common package or directory accessible from both frontend and backend.

Example:

```text
shared/
  Song.ts
  Player.ts
  GameState.ts
  SocketEvents.ts
```

---

## 4. Server Authority

The client must never be trusted to decide game results.

The server must own and validate:

- selected song
- current player
- turn order
- score
- timeline contents
- submitted placement
- correct placement
- round phase
- game phase
- card reveal
- transition to next turn

The client may submit intent.

Example:

```ts
submitPlacement({
  roundId,
  position
})
```

The client must not submit:

```ts
{
  correct: true,
  points: 1
}
```

The server calculates the result.

---

## 5. Hidden Information

Do not send unrevealed answer data to clients unnecessarily.

Before a card is revealed, avoid exposing:

- song title
- artist
- release year
- Billboard metadata
- correct timeline position

Do not rely on a client-side boolean such as:

```ts
hidden: true
```

if the hidden answer is already present in browser state.

After validation, the server may emit the reveal payload.

Example:

```ts
{
  title,
  artist,
  releaseYear,
  billboardYear,
  billboardRank
}
```

---

## 6. Game State Model

Prefer an explicit finite-state approach.

Recommended phases:

```text
LOBBY
STARTING
DRAWING_CARD
LISTENING
PLACING_CARD
CONFIRMING
REVEALING
RESOLVING
NEXT_PLAYER
FINISHED
```

Do not model the game using a large collection of unrelated booleans such as:

```ts
isDragging
isPlaying
isCorrect
isRevealed
isWaiting
isFinished
isLoading
```

when a single `phase` field can describe the state more reliably.

---

## 7. Song Model

A song must distinguish between:

- release year
- Billboard Year-End chart year

Recommended model:

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

Do not assume:

```text
releaseYear === billboardYear
```

The Billboard chart year determines whether a song belongs to the catalog.

The release year determines chronological placement in the game unless the project owner explicitly changes this rule.

---

## 8. Song Catalog Rules

Target catalog:

- Billboard Year-End Hot 100
- Top 10 songs per year
- Years 1960 through 2024 inclusive

Expected maximum catalog size:

```text
65 years × 10 songs = 650 songs
```

The final catalog should be stored locally after curation.

Do not query Billboard or another source during every game session.

The runtime game should use a local normalized catalog.

All imported catalog entries must be reviewed for:

- title
- artist
- release year
- Billboard year
- Billboard rank
- provider identifiers where available

---

## 9. Music Provider Architecture

The game logic must not depend directly on Spotify, Apple Music, YouTube, or any single audio provider.

Use an abstraction.

Example:

```ts
interface MusicProvider {
  load(song: Song): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  stop(): void;
}
```

Possible implementations:

```text
LocalMusicProvider
SpotifyMusicProvider
AppleMusicProvider
YouTubeMusicProvider
```

During early development, prefer legal local or royalty-free test audio.

Do not block development of game mechanics on a third-party music API.

Do not spread provider-specific calls throughout React components.

Bad:

```ts
spotify.play(...)
spotify.pause(...)
```

inside multiple UI components.

Good:

```ts
music.play()
music.pause()
```

through a provider abstraction.

---

## 10. Music API Constraints

Do not assume 30-second preview URLs will always exist.

Do not build the project around deprecated Spotify preview URLs.

Do not use third-party preview services in ways that violate their terms.

Do not hide or manipulate third-party players in ways that violate provider requirements.

If a music provider requires:

- subscription
- Premium account
- authentication
- visible player UI
- usage restrictions

those constraints must be documented before integration.

For the MVP, local test audio is preferred.

---

## 11. Drag and Drop

Use dnd-kit for interaction logic such as:

- draggable elements
- droppable areas
- sortable positions
- pointer sensors
- touch sensors
- collision detection
- valid drop regions

Do not rely on HTML5 native Drag and Drop for the primary gameplay interaction.

The game must support both:

- desktop pointer input
- touch input

The timeline must remain usable on mobile screens.

---

## 12. Animation Rules

Use Motion for React for visual movement and physical-feeling transitions.

Motion is responsible for:

- card pickup
- scale
- rotation
- shadows
- springs
- card entry
- card exit
- reveal animation
- automatic repositioning
- score feedback
- turn transitions
- timeline layout transitions

dnd-kit decides where a card can move.

Motion decides how that movement feels.

Do not duplicate ownership of positioning logic between the two libraries.

---

## 13. Animation Style

The target feeling is comparable to polished online card games.

Card movement should simulate physical handling.

Recommended interaction behaviors:

### Pickup

```text
scale: 1 -> ~1.05
translateY: 0 -> negative offset
slight rotation
larger shadow
```

### Valid drop

Use a spring-like snap.

### Invalid placement result

Recommended sequence:

```text
reveal
pause briefly
lift
slide to correct position
snap
settle
```

### Correct result

Recommended feedback:

```text
reveal
subtle pulse
+1 score animation
```

### Card reveal

Prefer a 3D flip or equivalent polished card transition.

Avoid excessive animation that makes turns slow.

Animations should communicate state, not merely decorate the interface.

---

## 14. Timeline Behavior

When a dragged card moves between existing timeline cards:

- show a clear insertion gap
- animate neighboring cards out of the way
- preserve chronological visual order

After confirmation:

- the server determines the correct position
- the client animates toward the authoritative result

If a guess is incorrect, the card must visibly move from the guessed position to the correct position.

Do not instantly teleport an incorrect card unless reduced-motion accessibility requires it.

---

## 15. Accessibility

Support:

- keyboard-focusable controls
- visible focus states
- touch input
- reduced-motion preferences
- readable contrast
- descriptive button labels

Important controls such as Play, Pause, Confirm, and Join Game must not depend only on icons.

Animations should respect:

```css
prefers-reduced-motion
```

where practical.

---

## 16. Multiplayer Architecture

Use Socket.IO.

Recommended room model:

```text
GameRoom
  id
  host
  players
  currentPlayer
  gameState
```

A player joins using a short room code.

Example:

```text
X7K2A
```

Socket.IO rooms should isolate game events between matches.

Do not broadcast game state globally to every connected user.

---

## 17. Socket Event Design

Use typed Socket.IO events.

Example client-to-server events:

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

Example server-to-client events:

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

Event payloads must use shared TypeScript types.

Avoid vague event names such as:

```text
update
change
data
message
```

when a domain-specific event name is possible.

---

## 18. Client State

Do not duplicate server-owned state unnecessarily.

The frontend may maintain:

- transient animation state
- drag position
- local UI state
- modal state
- audio control state
- optimistic visual state when safe

The frontend should receive authoritative game state from the server.

Use Zustand only where state genuinely needs to be shared across multiple components.

Do not introduce Redux unless the architecture later demonstrates a real need.

---

## 19. Project Structure

Recommended structure:

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

This structure may evolve, but separation of:

- client
- server
- shared domain types
- data

must remain clear.

---

## 20. UI Component Rules

Prefer small game-focused components.

Examples:

```text
SongCard
HiddenSongCard
RevealedSongCard
Timeline
TimelineSlot
Deck
PlayButton
ConfirmPlacementButton
PlayerList
Scoreboard
TurnIndicator
RoomCode
```

Do not put the entire game screen into a single large component.

Game rules must not live inside presentational components.

Avoid components that simultaneously:

- render UI
- manipulate sockets
- validate game rules
- choose songs
- calculate scoring

Split responsibilities.

---

## 21. Styling Rules

Use Tailwind CSS for application styling.

Keep visual constants centralized when possible.

Avoid arbitrary visual inconsistency between cards.

Card dimensions, border radius, shadows, spacing, and typography should form a reusable design system.

The layout must work for:

- desktop
- tablet
- mobile

The timeline may scroll horizontally when necessary.

---

## 22. Game Logic Rules

Game logic belongs primarily on the server.

Validation must handle:

- first card
- insertion before all cards
- insertion after all cards
- insertion between two cards
- songs sharing the same release year
- duplicate songs
- disconnected players
- invalid turn attempts
- stale round IDs
- repeated submissions

A player must not be able to submit another player's turn.

A round must not be scored twice.

---

## 23. Equal-Year Handling

Songs may share the same release year.

The placement validator must define deterministic behavior for equal years.

Recommended rule:

A song is correct if its selected insertion position is compatible with the non-decreasing chronological order of the timeline.

Do not assume all timeline years are unique.

---

## 24. Security and Trust

Never trust client-provided:

- score
- player identity without socket validation
- correct answer
- song year
- current turn
- game phase

Validate room membership for all multiplayer actions.

Reject stale or invalid commands.

Do not expose secrets, API keys, client secrets, or provider credentials to the browser.

Use environment variables for provider credentials.

Never commit `.env` files containing secrets.

---

## 25. ngrok Rules

The game should be testable locally through ngrok.

Prefer one public endpoint.

Recommended setup:

```text
localhost:3000
```

serving:

- React build
- HTTP API if needed
- Socket.IO

Expose with:

```bash
ngrok http 3000
```

Avoid architectures requiring several ngrok tunnels unless necessary.

Do not hardcode temporary ngrok URLs into the source code.

Use relative URLs whenever frontend and backend share an origin.

---

## 26. Development Phases

Follow this order unless a blocking requirement changes it.

### Phase 0 — Card Physics Prototype

Implement with fake data:

- timeline
- draggable card
- insertion slots
- animated reordering
- card flip
- automatic reposition animation

No multiplayer required.

### Phase 1 — Game Rules

Implement:

- draw card
- place card
- confirm
- validate
- award point
- reveal
- auto-place incorrect card
- next turn

Use mock songs.

### Phase 2 — Multiplayer

Implement:

- Node server
- Socket.IO
- rooms
- room codes
- players
- turns
- scores
- authoritative game state

### Phase 3 — ngrok

Test:

- laptop to phone
- multiple browsers
- WebSocket behavior
- disconnect/reconnect behavior

### Phase 4 — Audio Provider Layer

Implement:

- MusicProvider
- LocalMusicProvider

Then evaluate external providers.

### Phase 5 — Billboard Catalog

Create and validate the 1960–2024 Top 10 Year-End dataset.

### Phase 6 — Visual Polish

Improve:

- springs
- shadows
- card tilt
- deck animation
- card flip
- turn transition
- score feedback
- responsive mobile design
- sound effects

---

## 27. What Not To Add Yet

Do not introduce these during the MVP without a specific requirement:

- Next.js
- Angular
- Vue
- Svelte
- Django
- FastAPI
- PostgreSQL
- MySQL
- Redis
- MongoDB
- Prisma
- Docker
- Kubernetes
- GraphQL
- WebRTC
- Redux
- microservices
- user account system
- OAuth system unrelated to music provider requirements

These are not forbidden forever.

They are intentionally excluded until the project demonstrates a need.

---

## 28. Testing Priorities

At minimum, create tests for server-side game rules.

Prioritize tests for:

- correct insertion
- incorrect insertion
- edge insertion
- equal years
- duplicate submission
- wrong player turn
- stale round ID
- score increment
- next-player calculation

Animation tests are secondary to correctness.

---

## 29. Performance

Avoid unnecessary rerenders during drag operations.

Do not synchronize pointer movement through Socket.IO frame-by-frame.

Drag movement is local UI state.

Only meaningful game actions should be sent over the network.

Example:

Do not send:

```text
card moved x=101
card moved x=102
card moved x=103
```

Send:

```text
card:placement-submit
```

after the player confirms.

---

## 30. Definition of Done for a Gameplay Feature

A gameplay feature is not complete until:

- the rule works
- the server validates it where applicable
- the client reflects server authority
- touch interaction works when relevant
- animation does not break state
- invalid actions are rejected
- TypeScript types are correct
- no secret information is unnecessarily exposed
- the behavior is documented if it changes architecture

---

## 31. Updating PROJECT_STATE.md

Whenever a meaningful architectural decision or milestone changes, update `PROJECT_STATE.md`.

Examples:

- selected music provider
- new game rule
- catalog rule changed
- multiplayer implemented
- persistence introduced
- folder structure changed
- phase completed
- blocking issue discovered

`PROJECT_STATE.md` should describe reality, not future wishes presented as completed work.

---

## 32. General Engineering Rule

Prefer the smallest architecture that correctly supports the current game.

Build the game mechanics first.

Polish the interaction second.

Integrate external music services only after the core loop is stable.

Do not let third-party APIs dictate the internal game architecture.
