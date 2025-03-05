
import { CSSProperties } from "react";

interface CursorProps {
  x: number;
  y: number;
  color: string;
  label?: string;
}

export const Cursor = ({ x, y, color, label }: CursorProps) => {
  const style: CSSProperties = {
    transform: `translate(${x}px, ${y}px)`,
    left: 0,
    top: 0,
  };

  return (
    <div className="canvas-cursor" style={style}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 3L14 21L17.5 14L23 10L6 3Z"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      
      {label && (
        <div 
          className="absolute left-6 top-0 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
          style={{ 
            backgroundColor: color, 
            color: '#fff', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)' 
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
