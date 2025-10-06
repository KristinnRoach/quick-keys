import { Component, mergeProps, onMount } from 'solid-js';
import { Application } from '@splinetool/runtime';

interface KeyboardSplineProps {
  onLoad?: () => void;
  sceneUrl?: string;
  /** Optional CSS filter for stylistic adjustments */
  filterValue?: string;
  /** Scale factor applied to the intrinsic canvas (1 = original) */
  zoom?: number;
  /** Pixels to move the canvas upward (positive moves content up) */
  offsetY?: number;
  /** Constrains the visible height (px). If omitted, wrapper auto-sizes */
  visibleHeight?: number;
  /** Additional class names for the outer wrapper */
  class?: string;
  // mixBlendMode?: MixBlendMode;
}

const DEFAULT_SCENE =
  'https://prod.spline.design/H4BdmaJX07H0BbfC/scene.splinecode';

const KeyboardSpline: Component<KeyboardSplineProps> = (userProps) => {
  // Provide defaults for zoom & offset
  const props = mergeProps({ zoom: 1, offsetY: 0 }, userProps);
  let canvasRef: HTMLCanvasElement | undefined;

  onMount(() => {
    if (!canvasRef) return;
    const app = new Application(canvasRef);
    app
      .load(props.sceneUrl || DEFAULT_SCENE)
      .then(() => {
        props.onLoad?.();
      })
      .catch((error: Error) => {
        console.error('Failed to load Spline scene:', error);
      });
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
          filter: props.filterValue || '',
        }}
      />
    </div>
  );
};

export default KeyboardSpline;

// type MixBlendMode =
//   | 'normal'
//   | 'multiply'
//   | 'screen'
//   | 'overlay'
//   | 'darken'
//   | 'lighten'
//   | 'color-dodge'
//   | 'color-burn'
//   | 'hard-light'
//   | 'soft-light'
//   | 'difference'
//   | 'exclusion'
//   | 'hue'
//   | 'saturation'
//   | 'color'
//   | 'luminosity';

// (Legacy implementation removed)
