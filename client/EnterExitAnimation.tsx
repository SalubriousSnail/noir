import anime from "animejs";
import React, { MutableRefObject, ReactNode, useLayoutEffect, useRef } from "react";
import { Container } from "react-pixi-fiber";
import { Target } from "../common/card";

export type EnterExitAnimationState<T> = { [id: string]: T };

export type EnterExitAnimationStatus = "entering" | "exiting" | "none";

export type EnterExitAnimatorProps<T extends Target> = {
  elements: T[];
  children: (state: T, status: EnterExitAnimationStatus, index: number | null) => JSX.Element;
};

export function EnterExitAnimator<T extends Target>(props: EnterExitAnimatorProps<T>) {
  const ref = useRef({} as EnterExitAnimationState<T>);

  let unusedStates = { ...ref.current };
  let i = 0;
  const children = props.elements.map((state) => {
    const status = state.id in ref.current ? "none" : "entering";
    delete unusedStates[state.id];
    ref.current[state.id] = state;
    return props.children(state, status, i++);
  });

  const exiting = Object.values(unusedStates).map((state) => {
    delete ref.current[state.id];
    return props.children(state, "exiting", null);
  });

  return <>{[...children, ...exiting]}</>;
}

export type EnterExitAnimationProps = {
  componentRef: MutableRefObject<Required<Container>>;
  children: ReactNode;
  status: EnterExitAnimationStatus;
  duration: number;
  scale: number;
};

export default function EnterExitAnimation(props: EnterExitAnimationProps) {
  useLayoutEffect(() => {
    const container = props.componentRef.current;

    if (props.status == "entering") {
      container.scale = { x: 0, y: 0 };
      anime({
        targets: container.transform.scale,
        duration: props.duration,
        easing: "linear",
        x: props.scale,
        y: props.scale,
      });
    }

    if (props.status == "exiting") {
      anime({
        targets: container.transform.scale,
        duration: props.duration,
        easing: "linear",
        x: 0,
        y: 0,
      });
    }
  });

  return <>{props.children}</>;
}
