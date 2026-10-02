# Raayan Craft 2

A browser-based Minecraft-like game built with HTML5, Three.js, and JavaScript.

## Overview

Raayan Craft 2 is a voxel-based sandbox game that runs directly in your web browser. It features block-based terrain generation, multiplayer support, inventory management, and various game mechanics similar to Minecraft.

## 🎮 Play Now

# https://raayancoding.github.io/raayan-craft-2/



## Features

- **Voxel-Based Gameplay** - Break and place blocks to shape your world
- **Procedurally Generated Terrain** - Endless world generation with chunks and biomes
- **Inventory System** - Collect and manage items in your inventory
- **Multiplayer Support** - Play with other players via WebRTC networking
- **Chat System** - Communicate with other players in real-time
- **GUI & Overlays** - User-friendly interface with game overlays
- **Command System** - Execute in-game commands (Help, Teleport, Time)
- **Sound Management** - Audio effects and ambient sounds
- **Networking** - Robust packet-based network communication

## Project Structure

```
raayancraft-2/
├── index.html              # Main HTML entry point
├── style.css              # Styling
├── libraries/             # External libraries (Three.js, encryption, compression)
├── src/
│   ├── js/
│   │   ├── Start.js       # Game initialization
│   │   └── net/raayancraft/
│   │       ├── client/    # Client-side game logic
│   │       ├── nbt/       # NBT data format support
│   │       └── util/      # Utility classes
│   └── resources/         # Game assets (textures, sounds, GUIs)
```

hen navigate to http://localhost:8000
     ```

## Controls

- **WASD** - Move around
- **Space** - Jump
- **Left Click** - Break blocks
- **Right Click** - Place blocks
- **E** - Open inventory
- **T** - Open chat
- **ESC** - Close current GUI/Menu

## Commands

Use `/` to start a command:
- `/help` - Display available commands
- `/tp <x> <y> <z>` - Teleport to coordinates
- `/time <value>` - Set game time

## Technologies

- **HTML5 Canvas** - Rendering foundation
- **Three.js** - 3D graphics rendering
- **WebRTC** - Multiplayer networking
- **NBT Format** - Data serialization (Minecraft format)
- **Encryption** - AES/SHA1 for secure communication

## Key Classes

### Client-Side
- `Minecraft` - Main game controller
- `GameWindow` - Game viewport and rendering
- `WorldClient` - Client-side world management
- `PlayerEntity` / `PlayerEntityMultiplayer` - Player representation
- `NetworkManager` - Network communication
- `Inventory` - Item management system
- `Chunk` / `ChunkSection` - World structure

### Utilities
- `BlockPosition` - 3D block coordinates
- `Vector3` / `Vector4` - Mathematical vectors
- `GameProfile` - Player profile information

## Multiplayer

Connect to other players by:
1. Entering a server address in the connection GUI
2. Sending packets through the `NetworkManager`
3. Chat messages and player actions sync in real-time

## Contributing

Feel free to fork, improve, and submit pull requests!

## License

This project is licensed under MIT License.

## Author

Created by Raayan Coding

---

Enjoy building! 🎮
