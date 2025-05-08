# Planets

![Demo](https://i.ibb.co/FLydNtYC/planets.gif)

## Getting Started

To run the project locally:

```bash
npm install
npm start
```

## Features

This project visualizes a 3D representation of a solar system using `react-force-graph-3d` and `three.js`. It includes the following features:

- **3D Force Graph**: Displays nodes and links representing celestial bodies and their relationships.
- **Custom Textures**: Applies realistic textures to planets, the moon, and the sun.
- **Interactive Camera**: Automatically orbits the scene and allows zooming and panning.
- **Node Interaction**: Clicking on a node zooms into it for a closer view.
- **Dynamic Elements**: Includes rotating planets, cloud layers for Earth and Venus, and Saturn's ring.
- **Background Skybox**: A starfield texture creates an immersive space environment.

## Textures

The following textures are used in the project and are located in the `public/textures/` directory:

- `sun.jpg`
- `jupiter.jpg`
- `earth.jpg`
- `mars.jpg`
- `saturn.jpg`
- `venus.jpg`
- `neptune.jpg`
- `moon.jpg`
- `starfield.jpg`
- `earth_clouds.jpg`
- `venus_athmosphere.jpg`
- `saturn_ring.png`

## How It Works

- **Node Creation**: Each celestial body is represented as a node with a unique texture and size.
- **Links**: Links define the parent-child relationships between celestial bodies.
- **Camera Animation**: The camera orbits the scene unless user interaction is detected.
- **Custom Meshes**: Nodes are rendered as 3D meshes with textures and additional features like rings and cloud layers.
