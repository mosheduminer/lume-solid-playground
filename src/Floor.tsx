import { Component, createSignal } from "solid-js";
import { positionZ } from "./utils";

const Floor: Component<{ totalWidthOfTracks: number; constSpeed: number; }> = (props) => {
  const length = 10000;
  const [areas, setAreas] = createSignal([0, -length]);
  let last = 0;

  return (
    <>
      <lume-box
        size={[props.totalWidthOfTracks, 0, length]}
        position={(x, y, z, t) => {
          const incrementedZ = positionZ(t, props.constSpeed);
          if (Math.floor(-incrementedZ / length) > last) {
            const second = areas()[1];
            setAreas([second, second - length]);
            last++;
          }
          return [0, 0, areas()[0]];
        }}
        rotation={[0, 0, 0]}
        align-point={[0.5, 0.5, 0]}
        mount-point={[0.5, 0.5, 0.5]}
        color="white"
        texture="textures/marble.jpg">
      </lume-box>
      <lume-box
        size={[props.totalWidthOfTracks, 0, length]}
        position={[0, 0, areas()[1]]}
        rotation={[0, 0, 0]}
        align-point={[0.5, 0.5, 0]}
        mount-point={[0.5, 0.5, 0.5]}
        color="white"
        texture="textures/marble.jpg">
      </lume-box>
    </>
  );
}

export default Floor;