import { useEffect, useRef, useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { Toolbar } from "./Toolbar";
import { Cursor } from "@/components/ui/Cursor";
import { toast } from "sonner";
import { DrawingOptions, ToolType, getCursorPosition } from "./utils";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [color, setColor] = useState("#000000");
  const [cursorVisible, setCursorVisible] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      // Set up context
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = color;
        context.lineWidth = 2;
        contextRef.current = context;
        
        // Fill with white background
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Show welcome toast
    toast("Welcome to the collaborative drawing canvas!", {
      description: "Select a tool from the toolbar to start drawing.",
      duration: 5000,
    });

    // Listen for export event from Header
    const handleExportEvent = (event: CustomEvent) => {
      if (event.detail.format === 'png') {
        handleExport();
      }
    };

    window.addEventListener('export-canvas', handleExportEvent as EventListener);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener('export-canvas', handleExportEvent as EventListener);
    };
  }, []);

  // Update stroke style when color changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
    }
  }, [color]);

  // Handle cursor movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getCursorPosition(canvas, e.nativeEvent);
    setCursorPosition(pos);
    setCursorVisible(true);

    if (isDrawing) {
      draw(pos.x, pos.y);
    }
  };

  // Handle canvas mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "select") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getCursorPosition(canvas, e.nativeEvent);
    startDrawing(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    endDrawing();
  };

  const handleMouseLeave = () => {
    setCursorVisible(false);
    endDrawing();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setCursorVisible(true);
  };

  // Drawing methods
  const startDrawing = (x: number, y: number) => {
    const context = contextRef.current;
    if (!context) return;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (x: number, y: number) => {
    const context = contextRef.current;
    if (!context || !isDrawing) return;

    context.lineTo(x, y);
    context.stroke();
  };

  const endDrawing = () => {
    const context = contextRef.current;
    if (!context) return;

    if (isDrawing) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  // Tool handlers
  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    
    const context = contextRef.current;
    if (!context) return;

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.lineWidth = 20;
    } else {
      context.globalCompositeOperation = "source-over";
      context.lineWidth = 2;
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    toast.success("Canvas cleared!");
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "canvas-drawing.png";
      link.href = dataURL;
      link.click();
      toast.success("Drawing exported as PNG!");
    } catch (err) {
      toast.error("Failed to export drawing");
      console.error(err);
    }
  };

  // Calculate cursor style based on active tool
  const getCursorStyle = () => {
    switch (activeTool) {
      case "select":
        return "cursor-pointer";
      case "eraser":
        return "cursor-none";
      case "pen":
        return "cursor-none";
      default:
        return "cursor-crosshair";
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex items-start gap-3 p-3">
        <Toolbar 
          activeTool={activeTool}
          onToolClick={handleToolClick}
          onClear={handleClear}
          onExport={handleExport}
        />
        
        <div className="flex flex-col gap-2 glass-panel py-2 px-1 animate-slide-in" style={{ animationDelay: "50ms" }}>
          <ColorPicker color={color} onChange={setColor} />
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden rounded-lg border border-border shadow-sm m-3">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${getCursorStyle()}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        />
        
        {cursorVisible && (activeTool === "pen" || activeTool === "eraser") && (
          <Cursor 
            x={cursorPosition.x} 
            y={cursorPosition.y} 
            color={activeTool === "eraser" ? "#000000" : color}
          />
        )}
      </div>
    </div>
  );
}
