import { Component, Show } from 'solid-js';

const Toggle: Component<{
  mode: string;
  onClick: () => void;
  class?: string;
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      class={`
        inline-flex items-center justify-center
        px-4 py-2 
        text-sm font-medium
        rounded-lg
        transition-colors
        bg-gray-700 hover:bg-gray-600
        text-white
        transform-gpu
        ${props.class || ''}
      `}
      style={{
        'will-change': 'transform',
        contain: 'layout',
      }}
    >
      <Show
        when={props.mode}
        fallback={<span class='animate-pulse'>Loading...</span>}
      >
        Toggle: {props.mode}
      </Show>
    </button>
  );
};

export default Toggle;
