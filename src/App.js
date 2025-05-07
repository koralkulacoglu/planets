import React, { useRef, useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";

const data = {
  nodes: [
    { id: "about", label: "Koral", type: "sun", color: "orange" },
    {
      id: "projects",
      label: "Projects",
      type: "jupiter",
      color: "white",
      parentId: "about",
    },
    {
      id: "employment",
      label: "Employment",
      type: "mars",
      color: "pink",
      parentId: "about",
    },
    {
      id: "contact",
      label: "Contact",
      type: "earth",
      color: "lightgreen",
      parentId: "about",
    },
    {
      id: "skills",
      label: "Skills",
      type: "saturn",
      color: "beige",
      parentId: "about",
    },
    {
      id: "education",
      label: "Education",
      type: "venus",
      color: "tan",
      parentId: "about",
    },
    {
      id: "secret",
      label: "Secret",
      type: "neptune",
      color: "lightblue",
      parentId: "about",
    },
    {
      id: "resume",
      label: "Resume",
      type: "moon",
      color: "gray",
      parentId: "projects",
    },
  ],
  links: [
    { source: "about", target: "projects" },
    { source: "about", target: "skills" },
    { source: "about", target: "employment" },
    { source: "about", target: "contact" },
    { source: "about", target: "education" },
    { source: "about", target: "secret" },
    { source: "contact", target: "resume" },
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
      const textureNames = [
        "sun.jpg",
        "jupiter.jpg",
        "earth.jpg",
        "mars.jpg",
        "saturn.jpg",
        "venus.jpg",
        "neptune.jpg",
        "moon.jpg",
        "starfield.jpg",
        "earth_clouds.jpg",
        "venus_athmosphere.jpg",
        "saturn_ring.png",
      ];
      const texturePromises = textureNames.map((name) =>
        loader.loadAsync(`/textures/${name}`)
      );
      const [
        sun,
        jupiter,
        earth,
        mars,
        saturn,
        venus,
        neptune,
        moon,
        starfield,
        earthClouds,
        venus_athmosphere,
        saturnRing,
      ] = await Promise.all(texturePromises);
      setTextures({
        sun,
        jupiter,
        earth,
        mars,
        saturn,
        venus,
        neptune,
        moon,
        starfield,
        earthClouds,
        venus_athmosphere,
        saturnRing,
      });

      const scene = fgRef.current?.scene();
      if (scene && starfield) {
        const geometry = new THREE.SphereGeometry(10000, 64, 64);
        const material = new THREE.MeshBasicMaterial({
          map: starfield,
          side: THREE.BackSide,
          color: 0x555555,
        });
        const skybox = new THREE.Mesh(geometry, material);
        scene.add(skybox);
      }
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

  useEffect(() => {
    fgRef.current.controls().noPan = true;
    fgRef.current.controls().maxDistance = 5000;
  }, []);

  const getNodeMaterial = (node) => {
    const texture = textures[node.type];
    return texture
      ? new THREE.MeshStandardMaterial({ map: texture })
      : new THREE.MeshStandardMaterial({ color: node.color });
  };

  const createNodeMesh = (node) => {
    const size = node.type === "sun" ? 14 : node.type === "moon" ? 6 : 10;
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = getNodeMaterial(node);
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

    if (node.type === "venus" && textures.venus_athmosphere) {
      const cloudGeometry = new THREE.SphereGeometry(size * 1.01, 32, 32);
      const cloudMaterial = new THREE.MeshStandardMaterial({
        map: textures.venus_athmosphere,
        transparent: true,
        opacity: 0.9,
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
      ringMesh.rotation.set(Math.PI / 2, 0.5, 0.5);
      mesh.add(ringMesh);
    }

    const sprite = new SpriteText(node.label);
    sprite.textHeight = node.type === "sun" ? 15 : 5;
    sprite.color = node.color;

    sprite.backgroundColor = "rgba(0, 0, 0, 0.6)";
    sprite.borderColor = node.color;
    sprite.borderWidth = 1;
    sprite.padding = 2;
    sprite.position.set(0, size + (node.type === "sun" ? 15 : 8), 0);

    mesh.add(sprite);

    return mesh;
  };

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
      backgroundColor="black"
      enableNodeDrag={true}
      showNavInfo={false}
      nodeThreeObject={createNodeMesh}
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
