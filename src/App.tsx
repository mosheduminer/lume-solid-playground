import * as LUME from 'lume';
import { Component, For } from 'solid-js';

const rotate = (t: number) => 180 * Math.sin(0.0004 * t)

const rotationFunction = (seed: number) => (
  x: number,
  y: number,
  z: number,
  t: number
) => [rotate(t / 1.4 * seed), rotate(t / 2.1 * seed), rotate(t / 2.4 * seed)];

const App: Component = () => {
  LUME.useDefaultNames();

  return (
    <lume-scene webgl enable-css={false}>
      <lume-perspective-camera active
        position={[0, 0, 1100]}
        align-point={[0.5, 0.5, 0.5]} />
      <lume-ambient-light intensity={0.35} />
      <lume-point-light
        align-point="0.5 0.5 0.5"
        position="-200 -200 400"
        intensity="0.5"
        shadow-map-width="1024"
        shadow-map-height="1024"
      ></lume-point-light>
      <lume-node
        size-mode={['proportional', 'proportional', 'literal']}
        size={[1, 1, 1000]}>
        <For each={Array(3)}>
          {(_, x) => {
            return <For each={Array(3)}>
              {(_, y) => {
                return <For each={Array(3)}>
                  {(_, z) => <Node
                    seed={(x() + 1) * (y() + 1) * (z() + 1) / 3}
                    origin={[0.25 * (x() + 1), 0.25 * (y() + 1), 0.25 * (z() + 1)]} />}
                </For>
              }}
            </For>
          }}
        </For>
      </lume-node>
    </lume-scene>
  );
}

const Node: Component<{
  origin: [number, number, number];
  seed: number;
}> = (props) => {
  return (
    <lume-node
      rotation={rotationFunction(props.seed)}
      align-point={props.origin.join(" ")}
      position={props.origin}
      origin={[0.5, 0.5, 0.5]}
      mount-point={[0.5, 0.5, 0.5]}
      opacity={0.5}>
      <lume-mesh id="model"
        has="box-geometry phong-material"
        size={[55, 55, 55]}
        color="white"
        texture="cement.jpg"
      />
    </lume-node>
  )
}

export default App;
