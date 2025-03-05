
import React, { useEffect, useRef, useState } from "react";
import { Shape, useSocketConnection, CursorPosition } from "@/lib/socket";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { toast } from "sonner";

type CanvasProps = {
  activeTool: "select" | "rectangle" | "circle" | "line";
  activeColor: string;
};

const Canvas: React.FC<CanvasProps> = ({ activeTool, activeColor }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { shapes, addShape, updateCursor } = useSocketConnection();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState<CursorPosition | null>(null);
  const [currentShape, setCurrentShape] = useState<Partial<Shape> | null>(null);
  const { toast: useToastFn } = useToast();

  // Throttle cursor updates to reduce network traffic
  const throttledUpdateCursor = useRef(
    debounce((position: CursorPosition) => {
      updateCursor(position);
    }, 10)
  ).current;

  // Handle cursor movement with improved performance
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor position via throttled function to reduce network load
    throttledUpdateCursor({ x, y });
    
    // Update shape if drawing
    if (isDrawing && startPosition) {
      switch (activeTool) {
        case "rectangle":
          setCurrentShape({
            type: "rectangle",
            x: Math.min(startPosition.x, x),
            y: Math.min(startPosition.y, y),
            width: Math.abs(x - startPosition.x),
            height: Math.abs(y - startPosition.y),
            color: activeColor,
          });
          break;
          
        case "circle":
          const radius = Math.sqrt(
            Math.pow(x - startPosition.x, 2) + Math.pow(y - startPosition.y, 2)
          );
          setCurrentShape({
            type: "circle",
            x: startPosition.x,
            y: startPosition.y,
            radius,
            color: activeColor,
          });
          break;
          
        case "line":
          setCurrentShape({
            type: "line",
            x: startPosition.x,
            y: startPosition.y,
            points: [
              { x: startPosition.x, y: startPosition.y },
              { x, y },
            ],
            color: activeColor,
          });
          break;
          
        default:
          break;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "select") return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPosition({ x, y });
    
    // Initialize shape based on tool
    switch (activeTool) {
      case "rectangle":
        setCurrentShape({
          type: "rectangle",
          x,
          y,
          width: 0,
          height: 0,
          color: activeColor,
        });
        break;
        
      case "circle":
        setCurrentShape({
          type: "circle",
          x,
          y,
          radius: 0,
          color: activeColor,
        });
        break;
        
      case "line":
        setCurrentShape({
          type: "line",
          x,
          y,
          points: [{ x, y }],
          color: activeColor,
        });
        break;
        
      default:
        break;
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      // Only add shape if it has size
      if (
        (currentShape.type === "rectangle" && 
         (currentShape.width || 0) > 5 && 
         (currentShape.height || 0) > 5) ||
        (currentShape.type === "circle" && 
         (currentShape.radius || 0) > 5) ||
        (currentShape.type === "line" && 
         currentShape.points && 
         currentShape.points.length > 1 &&
         Math.hypot(
           currentShape.points[0].x - currentShape.points[1].x,
           currentShape.points[0].y - currentShape.points[1].y
         ) > 5)
      ) {
        addShape(currentShape as Omit<Shape, "id" | "userId">);
        
        // Show toast with shape information
        toast(`${currentShape.type.charAt(0).toUpperCase() + currentShape.type.slice(1)} added to canvas`, {
          position: "bottom-right"
        });
      }
    }
    
    setIsDrawing(false);
    setStartPosition(null);
    setCurrentShape(null);
  };

  // Clean up event handler
  useEffect(() => {
    return () => {
      throttledUpdateCursor.cancel();
    };
  }, [throttledUpdateCursor]);

  // Render a shape with improved visual feedback
  const renderShape = (shape: Shape) => {
    switch (shape.type) {
      case "rectangle":
        return (
          <motion.div
            key={shape.id}
            className="absolute border-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              borderColor: shape.color,
              backgroundColor: `${shape.color}20`,
            }}
          />
        );
        
      case "circle":
        return (
          <motion.div
            key={shape.id}
            className="absolute border-2 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              left: shape.x - (shape.radius || 0),
              top: shape.y - (shape.radius || 0),
              width: (shape.radius || 0) * 2,
              height: (shape.radius || 0) * 2,
              borderColor: shape.color,
              backgroundColor: `${shape.color}20`,
            }}
          />
        );
        
      case "line":
        if (!shape.points || shape.points.length < 2) return null;
        
        const startPoint = shape.points[0];
        const endPoint = shape.points[1];
        
        // Calculate line angle and length
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        return (
          <motion.div
            key={shape.id}
            className="absolute origin-left"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              left: startPoint.x,
              top: startPoint.y,
              width: length,
              height: 2,
              backgroundColor: shape.color,
              transform: `rotate(${angle}deg)`,
            }}
          />
        );
        
      default:
        return null;
    }
  };

  // Render current drawing shape with enhanced preview
  const renderCurrentShape = () => {
    if (!currentShape) return null;
    
    return renderShape({
      ...currentShape,
      id: "current",
      userId: "current",
    } as Shape);
  };

  return (
    <motion.div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-white rounded-lg shadow-sm border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Render all shapes */}
      {shapes.map(renderShape)}
      
      {/* Render current drawing shape */}
      {renderCurrentShape()}
      
      {/* Canvas coordinate grid (subtle) */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
             `,
             backgroundSize: '20px 20px'
           }} 
      />
    </motion.div>
  );
};

export default Canvas;
