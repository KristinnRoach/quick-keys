import { Component } from 'solid-js';
import { onMount } from 'solid-js';
import { Application } from '@splinetool/runtime';

interface KeyboardSplineProps {
  onLoad?: () => void;
  sceneUrl?: string;
  width?: string;
  height?: string;
  filterValue?: string;
  // mixBlendMode?: MixBlendMode;
}

const KeyboardSpline: Component<KeyboardSplineProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;

  onMount(() => {
    if (canvasRef) {
      const app = new Application(canvasRef);
      app
        .load(
          props.sceneUrl ||
            'https://prod.spline.design/ZpiHTUHQUsP10Dtk/scene.splinecode'
        )
        .catch((error: Error) => {
          console.error('Failed to load Spline scene:', error);
        });
    }
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: props.width || '100%',
        height: props.height || '100%',
        filter: props.filterValue || 'invert(75%)',
        'mask-image': 'linear-gradient(to bottom, black 80%, transparent 90%)',
        // 'mix-blend-mode': props.mixBlendMode || 'normal',
      }}
    />
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

// import { Canvas } from 'solid-three';

// <Canvas>
//   <div ref={canvasRef} />
// </Canvas>

// import type { ThreeEvent } from 'solid-three';

//   style={{
//     width: props.width || '100%',
//     height: props.height || '100%',
//   }}
