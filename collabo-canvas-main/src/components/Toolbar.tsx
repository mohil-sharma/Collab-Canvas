import React from "react";
import {
  Mouse,
  Square,
  Circle,
  LineHorizontal,
  Trash,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

type ToolbarProps = {
  activeTool: "select" | "rectangle" | "circle" | "line";
  setActiveTool: (tool: "select" | "rectangle" | "circle" | "line") => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  onClear: () => void;
  connectedUsers: number;
};

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  onClear,
  connectedUsers
}) => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#F97316", // orange
  ];

  const tools = [
    { id: "select", icon: <Mouse size={18} />, label: "Select" },
    { id: "rectangle", icon: <Square size={18} />, label: "Rectangle" },
    { id: "circle", icon: <Circle size={18} />, label: "Circle" },
    { id: "line", icon: <LineHorizontal size={18} />, label: "Line" },
  ] as const;

  const handleClear = () => {
    onClear();
    toast.info("Canvas cleared");
  };

  return (
    <motion.div
      className="glassmorphism p-2 rounded-lg flex flex-col gap-4 items-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <Tooltip key={tool.id} delayDuration={300}>
            <TooltipTrigger asChild>
              <motion.button
                type="button"
                className="tool-button"
                data-active={tool.id === activeTool}
                onClick={() => setActiveTool(tool.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tool.icon}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        <div className="w-full h-px bg-gray-200 my-2" />
        
        <div className="flex flex-col gap-2 items-center">
          {colors.map((color) => (
            <Tooltip key={color} delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  className="w-6 h-6 rounded-full relative"
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {color === activeColor && (
                    <div className="absolute inset-0 rounded-full border-2 border-white shadow-sm" />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Select color</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="w-full h-px bg-gray-200 my-2" />
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              className="tool-button text-red-500 hover:bg-red-500/10"
              onClick={handleClear}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash size={18} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Clear canvas</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="w-full h-px bg-gray-200 my-1" />
      
      <div className="flex items-center justify-center p-2 text-xs font-medium text-gray-500">
        <Users size={14} className="mr-1" /> {connectedUsers}
      </div>
    </motion.div>
  );
};

export default Toolbar;
