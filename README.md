# ⚔️ Cyber Apocalypse  
### Real-Time Multiplayer Infection Game · Server-Authoritative · WebSocket Architecture  

[![Frontend](https://img.shields.io/badge/frontend-Phaser%203-blue)]()
[![Backend](https://img.shields.io/badge/backend-Node.js-green)]()
[![Realtime](https://img.shields.io/badge/communication-Socket.IO-orange)]()
[![Input](https://img.shields.io/badge/input-Nipple.js-purple)]()

---

> A server-authoritative real-time multiplayer game where players move in a shared arena and an infection propagates dynamically until time expires or all players are infected.

> ### **Live Deployment (Web App):** https://cyber-apocalypse.vercel.app/

---

Room Creation and Joining:

https://github.com/user-attachments/assets/3a5340fa-6599-4264-aede-2a35ff712595

Gameplay Video:

https://github.com/user-attachments/assets/77975570-4e91-445d-9894-cb24dcb5b74d

Results screen:

<img width="1842" height="960" alt="Image" src="https://github.com/user-attachments/assets/b1ad9754-ed84-4fba-a49c-5c1bdfc3a769" />

## 🖥️ Tech Stack

**Frontend**
- Phaser 3, Nipple.js
- Vanilla JavaScript  

**Backend**
- Node.js  
- Socket.IO  

---

## 🧠 Architecture

```
                         ┌────────────────────────────┐
                         │ CLIENT (PLAYER / HOST)     │
                         │ Phaser 3 + nipple.js       │
                         └────────────┬───────────────┘
                                      │ input (vector)
                                      ▼
                         ┌────────────────────────────┐
                         │ INPUT NORMALIZATION        │
                         │ (keyboard + joystick)      │
                         └────────────┬───────────────┘
                                      │ socket.emit
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          SOCKET.IO SERVER                                    │
│                                                                              │
│   ┌─────────────────────────────┐        ┌──────────────────────────────┐    │
│   │ socketHandler.js            │───────▶│ room.js                      │    │
│   │-----------------------------│        │------------------------------│    │
│   │ - event routing             │        │ GLOBAL STATE                 │    │
│   │ - room lifecycle            │        │ rooms{}                      │    │
│   │ - game loop trigger         │        │                              │    │
│   └──────────────┬──────────────┘        │  ┌────────────────────────┐  │    │
│                  │                       │  │ PLAYER FLOW            │  │    │
│                  ▼                       │  │ join                   │  │    │
│   ┌─────────────────────────────┐        │  │  ↓                     │  │    │
│   │ GAME LOOP (50ms tick)       │        │  │ spawn                  │  │    │
│   │-----------------------------│        │  │  ↓                     │  │    │
│   │ input → state update        │        │  │ track                  │  │    │
│   │ state → broadcast           │        │  └────────────┬────────-──┘  │    │
│   └──────────────┬──────────────┘        │               ▼              │    │
│                  │                       │  ┌────────────────────────┐  │    │
│                  ▼                       │  │ SPAWN SYSTEM           │  │    │
│   ┌─────────────────────────────┐        │  │ random position        │  │    │
│   │ game.js                     │        │  │  ↓                     │  │    │
│   │-----------------------------│        │  │ validate against map   │  │    │
│   │                             │        │  │  ↓                     │  │    │
│   │  ┌───────────────────────┐  │        │  │ retry until valid      │  │    │
│   │  │ MOVEMENT SYSTEM       │  │        │  └────────────┬─────────-─┘  │    │
│   │  │ input                 │  │        │               ▼              │    │
│   │  │  ↓                    │  │        │  ┌────────────────────────┐  │    │
│   │  │ acceleration,         │  │        │  │ MAP ->                 │  │    │
│   │  │ velocity, friction    │  │        │  │ static building assets │  │    │
│   │  │  ↓                    │  │        │  └────────────────────────┘  │    │
│   │  │ bounded movement      │  │        └──────────────────────────────┘    │
│   │  └────────────┬──────────┘  │                                            │
│   │               ▼             │                                            │
│   │  ┌───────────────────────┐  │                                            │
│   │  │ COLLISION SYSTEM      │  │                                            │
│   │  │ next position         │  │                                            │
│   │  │  ↓                    │  │                                            │
│   │  │ check vs map          │  │                                            │
│   │  │  ↓                    │  │                                            │
│   │  │ block / allow         │  │                                            │
│   │  └────────────┬──────────┘  │                                            │
│   │               ▼             │                                            │
│   │  ┌───────────────────────┐  │                                            │
│   │  │ INFECTION SYSTEM      │  │                                            │
│   │  │ carriers/survivors    │  │                                            │
│   │  │  ↓                    │  │                                            │
│   │  │ proximity check       │  │                                            │
│   │  │  ↓                    │  │                                            │
│   │  │ role conversion       │  │                                            │
│   │  │  ↓                    │  │                                            │
│   │  │ freeze + message      │  │                                            │
│   │  │  ↓                    │  │                                            │
│   │  │ resume / end          │  │                                            │
│   │  └────────────┬──────────┘  │                                            │
│   │               ▼             │                                            │
│   │  ┌───────────────────────┐  │                                            │
│   │  │ ZONE MACHINE          │  │                                            │
│   │  │ lobby, message, game, │  │                                            │
│   │  │ game_over             │  │                                            │
│   │  └───────────────────────┘  │                                            │
│   └──────────────┬──────────────┘                                            │
│                  │                                                           │
│                  ▼                                                           │
│        AUTHORITATIVE GAME STATE                                              │
└──────────────────┬───────────────────────────────────────────────────────────┘
                   │ broadcast
                   ▼
        ┌────────────────────────────┐
        │ CLIENT (PLAYER / HOST)     │
        │ render via Phaser          │
        └────────────┬───────────────┘
                     │ visual feedback
                     ▼
              Player perception
                     │ decision
                     ▼
        ┌────────────────────────────┐
        │ INPUT GENERATION           │
        │ (user intent → controls)   │
        └────────────┬───────────────┘
                     │
                     └──────────────↺ (closed loop)
```

---

## ⚙️ System Design

### 🔒 Fully Server-Authoritative

- Clients send **only normalized input vectors**
- Server owns:
  - movement simulation  
  - collision detection  
  - infection logic  
  - zone transitions  

✔ No client-side decision making  
✔ No trust on client  

---

### ⏱️ Deterministic Game Loop

- Runs at **50ms tick (~20 updates/sec)**
- Independent of input frequency

Each tick:
1. Apply input → velocity  
2. Resolve collisions  
3. Update positions  
4. Check infections  
5. Broadcast state  

---

## 🧩 Backend Modules

### `socketHandler.js`
- Entry point for all socket communication  
- Handles:
  - room lifecycle  
  - game start  
  - input ingestion  
  - disconnections  
- Triggers the **main game loop**

---

### `room.js` — State Layer

- Maintains global `rooms{}` object  
- Handles:
  - player join / rejoin  
  - custom player IDs (not socket IDs)  
  - spawn logic  
  - room destruction  

#### Spawn System
- Random spawn within arena  
- Validated using `insideBuilding()`  
- Retries until valid  

---

### `game.js` — Simulation Layer

#### Movement
- Acceleration-based  
- Velocity clamped  
- Friction applied  
- Role-based scaling  

---

#### Collision
- Prevents entry into static buildings  
- Axis-wise resolution  

---

#### Infection
- Distance-based proximity check  
- Survivor → Carrier conversion  
- Game freeze + message broadcast  
- Resume or terminate  

---

#### Zone Machine
```
lobby → message → game → game_over
```

Controls entire game lifecycle.

---

## 🎮 Gameplay

- Players move using joystick (Nipple.js)  
- One random **carrier (patient zero)**  
- Carriers infect survivors on contact  
- Survivors avoid infection  

---

## 🏁 Game End Conditions

### ⏱️ Timer (120s)
- Survivors ranked highest  

### ☣️ All Infected
- Immediate termination  

---

## 📡 Networking Model

### Input
- Continuous stream (`inputX`, `inputY`)  
- Clamped to [-1, 1]  

### Output
- Full game state broadcast every tick  

---

## 🧱 Design Highlights

- Custom player identity system (not socket-bound)  
- Pure in-memory state (no DB latency)  
- Strict separation:
  - networking  
  - state  
  - simulation  

---

## ⚠️ Limitations

- Fixed tick loop (not adaptive)  
- Full state broadcast (no delta sync)  
- No persistence  

---

## 💡 Naming

> LAN Apocalypse → ⚡ Cyber Apocalypse  

Built for **real-time internet play**, not just LAN.

---

## 📸 Screens

- Home  
- Room  
- Arena  
- Infection Event  
- Results  
