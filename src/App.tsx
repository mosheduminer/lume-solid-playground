import * as LUME from 'lume';
import { Component, createSignal, JSX } from 'solid-js';
import { Entities, Entity, SetPosition, sizeFromArray } from './entities';
import { positionZ } from "./utils";
import Floor from "./Floor";


function App() {
  return <Game />;
}

const Game: Component = () => {
  LUME.useDefaultNames();
  const numOfTracks = 3;
  const totalWidthOfTracks = 600;
  const widthOfTrack = totalWidthOfTracks / numOfTracks;
  const constSpeed = 0.5;
  const maxJump = -250;

  const [collisionCheckTrigger, setCollisionCheckTrigger] = createSignal(undefined, () => true);

  let [offsetX, setOffsetX] = createSignal(0);
  let [offsetY, setOffsetY] = createSignal(0);

  window.addEventListener("keydown", (event) => {
    event.preventDefault();
    switch (event.key) {
      case "ArrowLeft":
        setOffsetX(offsetX() - 0.2);
        break;
      case "ArrowRight":
        setOffsetX(offsetX() + 0.2);
        break;
      case "ArrowUp":
        setOffsetY(offsetY() - 150);
        break;
    }
  });

  return (
    <lume-scene webgl enable-css={false} shadowmap-type="pcfsoft">
      <lume-perspective-camera active
        position={(x, y, z, t) => {
          // if (t % 10000 === 0) setCollisionCheckTrigger(undefined);
          return [0, -100, positionZ(t, constSpeed) + 325]
        }}
        rotation={[-10, 0, 0]}
        align-point={[0.5, 0.5, 0.5]} />
      <lume-ambient-light intensity={0.35} />
      <lume-point-light
        align-point="0.5 0.5 0.5"
        cast-shadow="true"
        position={(x, y, z, t) => [-200, -200, positionZ(t, constSpeed) - 250]}
        intensity="0.5"
        shadow-map-width="1024"
        shadow-map-height="1024"
      >
        <lume-mesh
          has="sphere-geometry basic-material"
          size="25 25 25"
          color="#ffff7c"
          receive-shadow="false"
          cast-shadow="false" />
      </lume-point-light>
      <Entities collisionCallback={console.log} getCollisions={collisionCheckTrigger} subscribed={["ball"]}>
        <Entity id={"ball"}>
          <Ball
            offsetX={offsetX()}
            setOffsetX={setOffsetX}
            offsetY={offsetY()}
            setOffsetY={setOffsetY}
            maxJump={maxJump}
            constSpeed={constSpeed}
            diameter={widthOfTrack / 3}
            totalWidthOfTracks={totalWidthOfTracks} />
        </Entity>
        <Entity id="obstacle">
          <Obstacle constSpeed={constSpeed} horizontalPosition={1} trackWidth={widthOfTrack} length={100000} />
        </Entity>
      </Entities>
      <Floor totalWidthOfTracks={totalWidthOfTracks} constSpeed={constSpeed} />
    </lume-scene>
  );
}

const Obstacle: Component<{
  trackWidth: number;
  horizontalPosition: number;
  length: number;
  constSpeed: number;
}> = (props) => {
  const size: LUME.XYZNumberValuesProperty = [props.trackWidth, props.trackWidth / 2, props.length];
  const sizeObj = sizeFromArray(size);

  const ret = (setPosition: SetPosition) => <lume-box
    size={size}
    position={(x, y, z, t) => {
      const final = [(props.horizontalPosition * props.trackWidth), -(props.trackWidth / 4), positionZ(t, props.constSpeed)];
      setPosition([sizeObj, sizeFromArray(final as any)]);
      return final;
    }}
    rotation={[0, 0, 0]}
    align-point={[0.5, 0.5, 0.5]}
    mount-point={[0.5, 0.5, 0.5]}
    color="grey" />
  return ret as JSX.FunctionElement;
}

const Ball: Component<{
  offsetX: number;
  setOffsetX: (v: number) => number;
  offsetY: number;
  setOffsetY: (v: number) => number;
  maxJump: number;
  constSpeed: number;
  diameter: number;
  totalWidthOfTracks: number;
}> = (props) => {
  const ballRotation = (distance: number) => {
    return distance / (props.diameter * Math.PI) * 360;
  }
  const rotateY = () => {
    return ballRotation(props.offsetX * (props.totalWidthOfTracks / 2));
  }
  let offsetXTrue = 0;
  let offsetYTrue = -(props.diameter / 2);

  const ret = (setPosition: SetPosition) => {
    const size: LUME.XYZNumberValuesProperty = [props.diameter, props.diameter, props.diameter];
    const sizeObj = sizeFromArray(size);
    return <lume-sphere
      cast-shadow="true"
      color="#ddad60"
      has="basic-material"
      texture="textures/cement.jpg"
      mount-point={[0.5, 0.5, 0.5]}
      align-point={[0.5, 0.5, 0.5]}
      size={size}
      position={(x, y, z, t) => {
        // X offset
        if (offsetXTrue < -1) {
          // do not allow moving too far off to the left
          props.setOffsetX(0);
          offsetXTrue = -1;
        } else if (offsetXTrue > 1) {
          // do not allow moving too far off to the right
          props.setOffsetX(0);
          offsetXTrue = 1;
        }
        if (props.offsetX < 0) {
          // move left
          const change = Math.max(props.offsetX, -0.05);
          props.setOffsetX(props.offsetX - change);
          offsetXTrue += change;
        } else if (props.offsetX > 0) {
          // move right
          const change = Math.min(props.offsetX, 0.05);
          props.setOffsetX(props.offsetX - change);
          offsetXTrue += change;
        }

        // Y offset
        if (offsetYTrue <= props.maxJump) {
          // do not allow jumping higher
          props.setOffsetY(0);
        }
        if (props.offsetY < 0) {
          // need to jump higher
          const change = Math.max(props.offsetY, -10);
          props.setOffsetY(props.offsetY - change);
          offsetYTrue += change;
        } else if (offsetYTrue !== -(props.diameter / 2)) {
          // start falling
          offsetYTrue = Math.min(offsetYTrue + 10, -(props.diameter / 2));
        }

        const final = [offsetXTrue * ((props.totalWidthOfTracks / 2) - props.diameter / 2), offsetYTrue, positionZ(t, props.constSpeed)];
        setPosition([sizeObj, sizeFromArray(final as any)]);
        return final;
      }}
      rotation={(x, y, z, t) => [ballRotation(-positionZ(t, props.constSpeed)), rotateY(), z]} />;
  }

  return ret as JSX.FunctionElement;
}

export default App;
