import { FC } from "react";

const Loader: FC = () => {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 33 33;270 33 33"
          begin="0s"
          dur="1.6s"
          fill="freeze"
          repeatCount="indefinite"
        />
        <circle
          fill="none"
          strokeWidth="7"
          strokeLinecap="square"
          cx="33"
          cy="33"
          r="30"
          strokeDasharray="187"
          strokeDashoffset="610"
        >
          <animate
            attributeName="stroke"
            values="#FFFFFF"
            begin="0s"
            dur="6.0s"
            fill="freeze"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 33 33;135 33 33;450 33 33"
            begin="0s"
            dur="1.6s"
            fill="freeze"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            values="187;46.75;187"
            begin="0s"
            dur="1.6s"
            fill="freeze"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
};

export default Loader;
