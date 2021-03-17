import { Component, createEffect, createSignal, For, JSX } from "solid-js";

export type XYZNumberValues = { x: number, y: number, z: number };

export const sizeFromArray = (size: [number, number, number]) => ({ x: size[0], y: size[1], z: size[2] });

export type SizeAndLocation = [XYZNumberValues, XYZNumberValues];

export type EntityProps = {
  setPosition: SetPosition;
}

export type SetPosition = (v: SizeAndLocation) => SizeAndLocation;

type CollisionEventDetail = {
  sizeAndLocation: SizeAndLocation;
  id: string;
}

type CollisionEvent = [CollisionEventDetail, CollisionEventDetail];

type CollisionCallback = (args: CollisionEvent[]) => void;

export const Entity: Component<{
  id: string;
}> = (props) => {
  return [props.id, props.children] as JSX.Element;
}

export const Entities: Component<{
  collisionCallback: CollisionCallback;
  getCollisions: () => any;
  subscribed: string[];
}> = (props) => {
  const sizeAndLocationsMap = new Map<string, () => SizeAndLocation | undefined>();

  createEffect(() => {
//    props.getCollisions();
    const collisions: CollisionEvent[] = [];
    for (const key of props.subscribed) {
      const sizeAndLocation = sizeAndLocationsMap.get(key);
      if (sizeAndLocation === undefined) continue;
      const SL = sizeAndLocation();
      if (SL === undefined) continue;
      const [size, location] = SL;
      for (const [otherId, otherSizeAndLocation] of sizeAndLocationsMap) {
        if (otherId === key) continue;
        const otherSL = otherSizeAndLocation();
        if (otherSL === undefined) continue;
        const [otherSize, otherLocation] = otherSL;

        // collision logic
        if (
          // left edge is to the left of other's right edge
          location.x - size.x / 2 < otherLocation.x + otherSize.x / 2
          // right edge is to the right of other's left edge
          && location.x + size.x / 2 > otherLocation.x - otherSize.x / 2
          // top edge is to the top of other's bottom edge
          && location.y - size.y / 2 < otherLocation.y + otherSize.y / 2
          // bottom edge is to the bottom of other's top edge
          && location.y + size.y / 2 > otherLocation.y - otherSize.y / 2
          // back edge is to the back of other's front edge
          && location.z - size.z / 2 < otherLocation.z + otherSize.z / 2
          // forward edge is to the back of other's back edge
          && location.z + size.z / 2 > otherLocation.z - otherSize.z / 2) {
          collisions.push([{ sizeAndLocation: SL, id: key }, { sizeAndLocation: otherSL, id: otherId }]);
        }
      }
    }
    if (collisions.length !== 0) {
      props.collisionCallback(collisions);
    }
  });

  return <For each={props.children as [string, (arg: SetPosition) => JSX.Element][]}>
    {([id, child]) => {
      const [position, setPosition] = createSignal<SizeAndLocation>();
      sizeAndLocationsMap.set(id, position);
      return child(setPosition);
    }}
  </For>
};