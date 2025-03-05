
// Canvas utility functions
export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const getCursorPosition = (
  canvas: HTMLCanvasElement,
  event: MouseEvent
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

export interface DrawingOptions {
  color: string;
  lineWidth: number;
  mode: "pen" | "eraser";
}

// Drawing state interfaces
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  id: string;
  points: Point[];
  options: DrawingOptions;
}

export interface DrawOperation {
  type: "draw";
  path: Path;
}

export interface ClearOperation {
  type: "clear";
}

export type Operation = DrawOperation | ClearOperation;

// Tool types
export type ToolType = "select" | "pen" | "eraser" | "rectangle" | "circle" | "text";
