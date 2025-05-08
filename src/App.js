import React, { useRef, useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";

const data = {
  nodes: [
    { id: "sun", color: "orange" },
    { id: "jupiter", color: "white", parentId: "sun" },
    { id: "mars", color: "pink", parentId: "sun" },
    { id: "earth", color: "lightgreen", parentId: "sun" },
    { id: "saturn", color: "beige", parentId: "sun" },
    { id: "venus", color: "tan", parentId: "sun" },
    { id: "neptune", color: "lightblue", parentId: "sun" },
    { id: "moon", color: "gray", parentId: "earth" },
  ],
  links: [
    { source: "sun", target: "jupiter" },
    { source: "sun", target: "mars" },
    { source: "sun", target: "earth" },
    { source: "sun", target: "saturn" },
    { source: "sun", target: "venus" },
    { source: "sun", target: "neptune" },
    { source: "earth", target: "moon" },
  ],
};

const Graph = () => {
  const fgRef = useRef();
  const angleRef = useRef(0);
  const [isZooming, setIsZooming] = useState(false);
  const [textures, setTextures] = useState({});
  const orbitDistance = 300;
  const nodeMeshes = useRef({});

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
          color: 0x888888,
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

  useEffect(() => {
    const animate = () => {
      Object.values(nodeMeshes.current).forEach((mesh) => {
        mesh.rotation.y += 0.005;
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const getNodeMaterial = (node) => {
    const texture = textures[node.id];
    return texture
      ? new THREE.MeshStandardMaterial({ map: texture })
      : new THREE.MeshStandardMaterial({ color: node.color });
  };

  const createNodeMesh = (node) => {
    const size = node.id === "sun" ? 14 : node.id === "moon" ? 6 : 10;
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = getNodeMaterial(node);
    const mesh = new THREE.Mesh(geometry, material);

    if (node.id === "earth" && textures.earthClouds) {
      const cloudGeometry = new THREE.SphereGeometry(size * 1.01, 32, 32);
      const cloudMaterial = new THREE.MeshStandardMaterial({
        map: textures.earthClouds,
        transparent: true,
        opacity: 0.3,
      });
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      mesh.add(cloudMesh);
    }

    if (node.id === "venus" && textures.venus_athmosphere) {
      const cloudGeometry = new THREE.SphereGeometry(size * 1.01, 32, 32);
      const cloudMaterial = new THREE.MeshStandardMaterial({
        map: textures.venus_athmosphere,
        transparent: true,
        opacity: 0.9,
      });
      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      mesh.add(cloudMesh);
    }

    if (node.id === "saturn" && textures.saturnRing) {
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

    nodeMeshes.current[node.id] = mesh;
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
