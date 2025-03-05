
import { 
  MousePointer, 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Trash2, 
  Download 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ToolType } from "./utils";
import { toast } from "sonner";

interface ToolbarProps {
  activeTool: ToolType;
  onToolClick: (tool: ToolType) => void;
  onClear: () => void;
  onExport: () => void;
}

export const Toolbar = ({ activeTool, onToolClick, onClear, onExport }: ToolbarProps) => {
  const tools = [
    { 
      id: "select" as ToolType, 
      icon: <MousePointer size={18} />, 
      label: "Select" 
    },
    { 
      id: "pen" as ToolType, 
      icon: <Pencil size={18} />, 
      label: "Pen" 
    },
    { 
      id: "eraser" as ToolType, 
      icon: <Eraser size={18} />, 
      label: "Eraser" 
    },
    { 
      id: "rectangle" as ToolType, 
      icon: <Square size={18} />, 
      label: "Rectangle" 
    },
    { 
      id: "circle" as ToolType, 
      icon: <Circle size={18} />, 
      label: "Circle" 
    },
    { 
      id: "text" as ToolType, 
      icon: <Type size={18} />, 
      label: "Text" 
    },
  ];

  const handleClear = () => {
    // Show a toast confirmation before clearing
    toast(
      "Are you sure you want to clear the canvas?",
      {
        action: {
          label: "Clear",
          onClick: onClear,
        },
        cancel: {
          label: "Cancel",
          onClick: () => {}, // Add the required onClick handler
        },
      }
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col items-center gap-1 p-2 glass-panel animate-slide-in">
        <div className="space-y-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  className={`tool-button ${activeTool === tool.id ? "active" : ""}`}
                  onClick={() => onToolClick(tool.id)}
                  aria-label={tool.label}
                >
                  {tool.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-panel">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="tool-button text-destructive hover:bg-destructive/10" 
                onClick={handleClear}
                aria-label="Clear canvas"
              >
                <Trash2 size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="glass-panel">
              <p>Clear canvas</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="tool-button" 
                onClick={onExport}
                aria-label="Export as PNG"
              >
                <Download size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="glass-panel">
              <p>Export as PNG</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
