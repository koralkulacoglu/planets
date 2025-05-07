import React, { useRef, useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";

const data = {
  nodes: [
    { id: "about", label: "About Me", type: "sun", color: "gold" },
    {
      id: "projects",
      label: "Projects",
      type: "jupiter",
      color: "white",
      parentId: "about",
    },
    {
      id: "skills",
      label: "Skills",
      type: "mars",
      color: "white",
      parentId: "about",
    },
    {
      id: "experience",
      label: "Experience",
      type: "earth",
      color: "white",
      parentId: "about",
    },
    {
      id: "contact",
      label: "Contact",
      type: "saturn",
      color: "white",
      parentId: "about",
    },
    {
      id: "Admini",
      label: "Admini",
      type: "moon",
      color: "gray",
      parentId: "projects",
    },
    {
      id: "FourSight",
      label: "FourSight",
      type: "moon",
      color: "gray",
      parentId: "projects",
    },
    {
      id: "React",
      label: "React",
      type: "moon",
      color: "gray",
      parentId: "skills",
    },
    {
      id: "AWS",
      label: "AWS",
      type: "moon",
      color: "gray",
      parentId: "skills",
    },
    {
      id: "MIPS",
      label: "MIPS Assembly",
      type: "moon",
      color: "gray",
      parentId: "skills",
    },
    {
      id: "AdminiRole",
      label: "Lead @ Admini",
      type: "moon",
      color: "gray",
      parentId: "experience",
    },
    {
      id: "Resume",
      label: "Resume",
      type: "moon",
      color: "gray",
      parentId: "contact",
    },
    {
      id: "Email",
      label: "Email",
      type: "moon",
      color: "gray",
      parentId: "contact",
    },
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
      const [
        sun,
        jupiter,
        earth,
        mars,
        saturn,
        moon,
        starfield,
        earthClouds,
        saturnRing,
      ] = await Promise.all([
        loader.loadAsync("/textures/sun.jpg"),
        loader.loadAsync("/textures/jupiter.jpg"),
        loader.loadAsync("/textures/earth.jpg"),
        loader.loadAsync("/textures/mars.jpg"),
        loader.loadAsync("/textures/saturn.jpg"),
        loader.loadAsync("/textures/moon.jpg"),
        loader.loadAsync("/textures/starfield.jpg"),
        loader.loadAsync("/textures/earth_clouds.jpg"),
        loader.loadAsync("/textures/saturn_ring.png"),
      ]);
      setTextures({
        sun,
        jupiter,
        earth,
        mars,
        saturn,
        moon,
        starfield,
        earthClouds,
        saturnRing,
      });

      const scene = fgRef.current.scene();
      scene.background = starfield;
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
        const size = node.type === "sun" ? 14 : node.type === "moon" ? 6 : 10;
        const geometry = new THREE.SphereGeometry(size, 32, 32);

        const texture = textures[node.type];
        const material = texture
          ? new THREE.MeshStandardMaterial({ map: texture })
          : new THREE.MeshStandardMaterial({ color: node.color });

        const mesh = new THREE.Mesh(geometry, material);

        if (node.type === "earth" && textures.earthClouds) {
          const cloudGeometry = new THREE.SphereGeometry(size * 1.01, 32, 32);
          const cloudMaterial = new THREE.MeshStandardMaterial({
            map: textures.earthClouds,
            transparent: true,
            opacity: 0.3,
          });
          const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
          mesh.add(cloudMesh);
        }

        if (node.type === "saturn" && textures.saturnRing) {
          const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2.2, 64);
          const ringMat = new THREE.MeshBasicMaterial({
            map: textures.saturnRing,
            side: THREE.DoubleSide,
            transparent: true,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.rotation.y = 0.5;
          ringMesh.rotation.z = 0.5;
          mesh.add(ringMesh);
        }

        const sprite = new SpriteText(node.label);
        sprite.textHeight = 10;
        sprite.color = node.color;
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
