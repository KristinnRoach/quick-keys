import { Component, mergeProps, onCleanup, onMount } from 'solid-js';
import { Application } from '@splinetool/runtime';

interface KeyboardSplineProps {
  onLoad?: () => void;
  sceneUrl?: string;
  cssFilter?: string;
  zoom?: number;
  offsetY?: number;
  visibleHeight?: number;
  class?: string;
}

const DEFAULT_SCENE =
  'https://prod.spline.design/H4BdmaJX07H0BbfC/scene.splinecode';

const KeyboardSpline: Component<KeyboardSplineProps> = (userProps) => {
  // Provide defaults for zoom & offset
  const props = mergeProps({ zoom: 1, offsetY: 0 }, userProps);
  let canvasRef: HTMLCanvasElement | undefined;
  let splineApp: Application | undefined;

  onMount(() => {
    if (!canvasRef) return;
    splineApp = new Application(canvasRef);
    splineApp
      .load(props.sceneUrl || DEFAULT_SCENE)
      .then(() => {
        props.onLoad?.();
      })
      .catch((error: Error) => {
        console.error('Failed to load Spline scene:', error);
      });
  });

  onCleanup(() => {
    splineApp?.dispose();
  });

  const wrapperStyle: Record<string, string> = {};
  if (props.visibleHeight) wrapperStyle.height = props.visibleHeight + 'px';

  return (
    <div
      class={`relative overflow-hidden w-full ${props.class || ''}`}
      style={wrapperStyle}
    >
      <canvas
        ref={canvasRef}
        class='block origin-top-left w-full h-full'
        style={{
          transform: `scale(${props.zoom}) translateY(-${props.offsetY}px)`,
          filter: props.cssFilter || '',
        }}
      />
    </div>
  );
};

export default KeyboardSpline;
