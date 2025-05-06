import React, { useRef, useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";

const data = {
  nodes: [
    { id: "about", label: "About Me", type: "sun" },
    { id: "projects", label: "Projects", type: "planet", parentId: "about" },
    { id: "skills", label: "Skills", type: "planet", parentId: "about" },
    {
      id: "experience",
      label: "Experience",
      type: "planet",
      parentId: "about",
    },
    { id: "contact", label: "Contact", type: "planet", parentId: "about" },
    { id: "Admini", label: "Admini", type: "moon", parentId: "projects" },
    { id: "FourSight", label: "FourSight", type: "moon", parentId: "projects" },
    { id: "React", label: "React", type: "moon", parentId: "skills" },
    { id: "AWS", label: "AWS", type: "moon", parentId: "skills" },
    { id: "MIPS", label: "MIPS Assembly", type: "moon", parentId: "skills" },
    {
      id: "AdminiRole",
      label: "Lead @ Admini",
      type: "moon",
      parentId: "experience",
    },
    { id: "Resume", label: "Resume", type: "moon", parentId: "contact" },
    { id: "Email", label: "Email", type: "moon", parentId: "contact" },
  ],
  links: [
    { source: "about", target: "projects" },
    { source: "about", target: "skills" },
    { source: "about", target: "experience" },
    { source: "about", target: "contact" },
    { source: "projects", target: "Admini" },
    { source: "projects", target: "FourSight" },
    { source: "skills", target: "React" },
    { source: "skills", target: "AWS" },
    { source: "skills", target: "MIPS" },
    { source: "experience", target: "AdminiRole" },
    { source: "contact", target: "Resume" },
    { source: "contact", target: "Email" },
  ],
};

const Graph = () => {
  const fgRef = useRef();
  const angleRef = useRef(0);
  const [isZooming, setIsZooming] = useState(false);
  const [textures, setTextures] = useState({});
  const orbitDistance = 300;

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadTextures = async () => {
      const [sun, planet, moon, starfield] = await Promise.all([
        loader.loadAsync("/textures/sun.jpg"),
        loader.loadAsync("/textures/planet.jpg"),
        loader.loadAsync("/textures/moon.jpg"),
        loader.loadAsync("/textures/starfield.jpg"),
      ]);
      setTextures({ sun, planet, moon, starfield });

      const scene = fgRef.current.scene();
      scene.background = starfield;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(100, 100, 100);
      scene.add(ambientLight, pointLight);
    };

    loadTextures();
  }, []);

  useEffect(() => {
    const controls = fgRef.current?.controls();
    if (!controls) return;

    const handleUserInteraction = () => setIsZooming(true);
    controls.addEventListener("start", handleUserInteraction);

    const interval = setInterval(() => {
      if (!fgRef.current || isZooming) return;

      angleRef.current += Math.PI / 360;
      const angle = angleRef.current;

      fgRef.current.cameraPosition({
        x: orbitDistance * Math.sin(angle),
        z: orbitDistance * Math.cos(angle),
        y: 40 * Math.sin(angle / 2),
      });
    }, 30);

    return () => {
      clearInterval(interval);
      controls.removeEventListener("start", handleUserInteraction);
    };
  }, [isZooming]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
      backgroundColor="black"
      enableNodeDrag={false}
      nodeThreeObject={(node) => {
        if (!textures.sun) return null; // wait until textures are loaded

        const size = node.type === "sun" ? 14 : node.type === "planet" ? 10 : 6;
        const geometry = new THREE.SphereGeometry(size, 32, 32);

        const material =
          node.type === "sun"
            ? new THREE.MeshBasicMaterial({
                map: textures.sun,
              })
            : new THREE.MeshStandardMaterial({
                map: node.type === "planet" ? textures.planet : textures.moon,
              });

        const mesh = new THREE.Mesh(geometry, material);

        const sprite = new SpriteText(node.label);
        sprite.textHeight = 10;
        sprite.color =
          node.type === "sun"
            ? "gold"
            : node.type === "planet"
            ? "lightblue"
            : "gray";

        sprite.position.set(0, size + 10, 0);
        mesh.add(sprite);

        return mesh;
      }}
      onNodeClick={(node) => {
        const dist = 40;
        const distRatio = 1 + dist / Math.hypot(node.x, node.y, node.z);
        const newPos = {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        };
        setIsZooming(true);
        fgRef.current.cameraPosition(newPos, node, 3000, () =>
          setIsZooming(false)
        );
      }}
    />
  );
};

export default Graph;
