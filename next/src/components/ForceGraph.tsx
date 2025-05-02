'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Canvas,
  useThree,
  useFrame,
  extend,
  ThreeElement
} from '@react-three/fiber'
import {
  MapControls,
  OrbitControls,
  PresentationControls
} from '@react-three/drei'
import * as THREE from 'three'
import * as d3 from 'd3'
import { forceSimulation } from 'd3'
import { setters, useAppStore } from '../services/store'
import { Font, TextGeometry } from 'three/examples/jsm/Addons.js'
import helvetiker from 'three/examples/fonts/helvetiker_regular.typeface.json'

// MovingLight component that follows mouse position
function MovingLight() {
  const { camera, viewport, gl } = useThree()
  const light = useRef<THREE.SpotLight>(null)
  const vec = new THREE.Vector3()

  useEffect(() => {
    const onMouseMove = (ev: MouseEvent) => {
      if (light.current) {
        // Get normalized device coordinates (-1 to +1)
        const mouse = new THREE.Vector2()
        const rect = gl.domElement.getBoundingClientRect()
        mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1

        // Unproject mouse point to 3D world space
        vec.set(mouse.x, mouse.y, 0.5)
        vec.unproject(camera)

        // Get the direction vector (pointing from camera to mouse position)
        vec.sub(camera.position).normalize()

        // Calculate a point at some distance from the camera in the mouse direction
        const distance = 200 // Adjust this value as needed
        vec.multiplyScalar(distance).add(camera.position)

        // Update light position
        light.current.position.copy(vec)
        // Make light point toward the center
        // light.current.lookAt(0, 0, 0)
      }
    }
    gl.domElement.addEventListener('mousemove', onMouseMove)
    return () => {
      gl.domElement.removeEventListener('mousemove', onMouseMove)
    }
  })

  return (
    <>
      <pointLight ref={light} distance={10000} decay={0.5} intensity={1} />
      <ambientLight intensity={0} />
    </>
  )
}

interface ForceGraphProps {
  records: DACSRecord[]
  groupBy: string | null
}

// Node type for our visualization
interface Node extends d3.SimulationNodeDatum {
  id: string
  group: string
  radius: number
  color: string
  record: DACSRecord
  x?: number
  y?: number
  z?: number
}

// Link type for connections between nodes
interface Link {
  source: string
  target: string
  value: number
}

// Define color scheme for different groups
const colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
extend({ TextGeometry })
declare module '@react-three/fiber' {
  interface ThreeElements {
    textGeometry: ThreeElement<typeof TextGeometry>
  }
}

const Node = ({
  nodeRef,
  color,
  radius,
  record,
  onClick,
  font
}: {
  nodeRef: React.RefObject<Node>
  color: string
  radius: number
  record: DACSRecord
  onClick: (ev: MouseEvent) => void
  font: Font
}) => {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const isSelected = useAppStore(
    state => state.selectedNode === record.identifier
  )

  // Imperatively update mesh position from nodeRef.current
  useFrame(() => {
    if (meshRef.current && nodeRef.current) {
      meshRef.current.position.set(
        nodeRef.current.x || 0,
        nodeRef.current.y || 0,
        nodeRef.current.z || 0
      )
    }
  })

  return (
    <group ref={meshRef} onClick={onClick}>
      <mesh position={[15, -5, 0]}>
        <textGeometry
          args={[
            record.title,
            { size: 10, font, depth: 0.1, curveSegments: 3 }
          ]}
        />
        <meshBasicMaterial color='white' />
      </mesh>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[radius, radius, radius]} />
        <meshStandardMaterial
          color={isSelected ? 'yellow' : 'white'}
          transparent={true}
          opacity={0.8}
          metalness={10}
          emissive={isSelected ? 100 : hovered ? 100 : 0}
        />
      </mesh>
    </group>
  )
}

export default function ForceGraph({ records, groupBy }: ForceGraphProps) {
  const simulation = useRef<d3.Simulation<Node, Link> | null>(null)
  const nodes = useRef<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const selectedNodeId = useAppStore(state => state.selectedNode)
  const font = useMemo(() => {
    const loader = new Font(helvetiker)
    return loader
  }, [])

  // Convert records to graph data structure
  useEffect(() => {
    if (!records || records.length === 0) return

    // Create nodes
    const newNodes: Node[] = records.map(record => {
      // Determine group based on groupBy option
      let group = 'default'

      if (groupBy) {
        switch (groupBy) {
          case 'subjects':
            group = record.subjectAccessPoints?.[0] || 'unknown'
            break
          case 'authors':
            group = record.nameAccessPoints?.[0] || 'unknown'
            break
          default:
            group = 'default'
        }
      }

      return {
        id: record.identifier,
        group,
        radius: 10, // Size based on content length
        // color: colorScheme(group) as string,
        color: '#ffffff',
        record
      }
    })

    // Create links based on relationships
    const newLinks: Link[] = []

    // Connect nodes with similar properties
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const nodeA = newNodes[i]
        const nodeB = newNodes[j]
        const recordA = nodeA.record
        const recordB = nodeB.record

        let shouldConnect = false
        let connectionStrength = 0

        // Connect if they share the same group
        if (
          nodeA.group === nodeB.group &&
          nodeA.group !== 'default' &&
          nodeA.group !== 'unknown'
        ) {
          shouldConnect = true
          connectionStrength += 2
        }

        // Connect if they share subject access points
        if (recordA.subjectAccessPoints && recordB.subjectAccessPoints) {
          const sharedSubjects = recordA.subjectAccessPoints.filter(subject =>
            recordB.subjectAccessPoints?.includes(subject)
          )
          if (sharedSubjects.length > 0) {
            shouldConnect = true
            connectionStrength += sharedSubjects.length
          }
        }

        // Connect if they share name access points
        if (recordA.nameAccessPoints && recordB.nameAccessPoints) {
          const sharedNames = recordA.nameAccessPoints.filter(name =>
            recordB.nameAccessPoints?.includes(name)
          )
          if (sharedNames.length > 0) {
            shouldConnect = true
            connectionStrength += sharedNames.length
          }
        }

        // Add link if connection criteria met
        if (shouldConnect) {
          newLinks.push({
            source: nodeA.id,
            target: nodeB.id,
            value: connectionStrength
          })
        }
      }
    }

    nodes.current = newNodes
    setLinks(newLinks)

    // Initialize force simulation
    simulation.current = d3
      .forceSimulation(newNodes)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(0, 0))
      .force(
        'link',
        d3
          .forceLink<Node, Link>(newLinks)
          .id(d => d.id)
          .distance(d => 10 / (d.value || 1))
          .strength(d => d.value * 0.1)
      )
      .force('x', d3.forceX().strength(0.02))
      .force('y', d3.forceY().strength(0.02))
      .force(
        'collide',
        d3.forceCollide().radius(d => 10 * 2)
      )
      .on('tick', () => {
        // Update node positions in state
        nodes.current = [...newNodes]
      })

    return () => {
      simulation.current?.stop()
    }
  }, [records, groupBy])

  // Helper to get 3D position from node - just reads from ref
  const getNodePosition = (node: Node): [number, number, number] => {
    return [node.x || 0, node.y || 0, node.z || 0]
  }

  const Link = ({
    sourceRef,
    targetRef,
    color = '#cccccc'
  }: {
    sourceRef: React.RefObject<Node>
    targetRef: React.RefObject<Node>
    color?: string
  }) => {
    const lineRef = useRef<THREE.LineSegments>(null)
    useFrame(() => {
      if (lineRef.current && sourceRef.current && targetRef.current) {
        const positions = lineRef.current.geometry.attributes.position.array
        positions[0] = sourceRef.current.x || 0
        positions[1] = sourceRef.current.y || 0
        positions[2] = sourceRef.current.z || 0
        positions[3] = targetRef.current.x || 0
        positions[4] = targetRef.current.y || 0
        positions[5] = targetRef.current.z || 0
        lineRef.current.geometry.attributes.position.needsUpdate = true
      }
    })
    // Initialize geometry with dummy positions
    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)
      )
      return geo
    }, [])
    return (
      <lineSegments ref={lineRef} geometry={geometry}>
        <lineBasicMaterial attach='material' color={color} linewidth={1} />
      </lineSegments>
    )
  }

  // Create refs for each node
  const nodeRefs = useRef<{ [id: string]: React.RefObject<Node> }>({})
  nodes.current.forEach(node => {
    if (!nodeRefs.current[node.id]) {
      nodeRefs.current[node.id] = { current: node }
    } else {
      nodeRefs.current[node.id].current = node
    }
  })

  return (
    <div className='h-full w-full bg-gray-900'>
      <Canvas camera={{ position: [0, 0, 1000], up: [0, 0, 1] }}>
        <MovingLight />
        {/* Nodes */}
        {nodes.current.map(node => (
          <Node
            font={font}
            key={node.id}
            nodeRef={nodeRefs.current[node.id]}
            color={node.color}
            radius={node.radius}
            record={node.record}
            onClick={(ev: MouseEvent) => {
              setters.set({
                selectedNode: selectedNodeId === node.id ? null : node.id
              })
              ev.stopImmediatePropagation()
            }}
          />
        ))}
        {/* Links */}
        {links.map((link, index) => {
          const sourceRef = nodeRefs.current[link.source]
          const targetRef = nodeRefs.current[link.target]
          if (!sourceRef || !targetRef) return null
          return (
            <Link
              key={`link-${index}`}
              sourceRef={sourceRef}
              targetRef={targetRef}
              color={link.value > 2 ? '#ffffff' : '#888888'}
            />
          )
        })}
        <MapControls />
        <gridHelper
          args={[1000, 10, '#404040', '#404040']}
          rotation={[0.25 * Math.PI * 2, 0, 0]}
        />
      </Canvas>
      {/* Information Panel */}
      {selectedNodeId && (
        <div className='absolute bottom-0 right-0 p-4 bg-black bg-opacity-70 text-white max-w-md m-4 rounded border border-white/50'>
          <h3 className='text-xl font-bold'>
            {nodes.current.find(node => node.id === selectedNodeId)?.record
              .title || ''}
          </h3>
          <div className='mt-2 text-sm'>
            <p>
              {nodes.current
                .find(node => node.id === selectedNodeId)
                ?.record.eventActors?.map(x => (
                  <span className='inline-block mr-2'>{x.name}</span>
                ))}
            </p>
            {nodes.current.find(node => node.id === selectedNodeId)?.record
              .scopeAndContent && (
              <p className='mt-2 max-h-[300px] overflow-auto mb-2'>
                {
                  nodes.current.find(node => node.id === selectedNodeId)?.record
                    .scopeAndContent
                }
              </p>
            )}
            <p className='text-sm'>
              <strong>From</strong>{' '}
              {
                nodes.current.find(node => node.id === selectedNodeId)?.record
                  .repository
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
