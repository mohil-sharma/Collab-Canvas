
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const colors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF3B30", // Red
    "#FF9500", // Orange
    "#FFCC00", // Yellow
    "#34C759", // Green
    "#5AC8FA", // Light Blue
    "#007AFF", // Blue
    "#5856D6", // Purple
    "#AF52DE", // Pink
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className="tool-button relative group flex items-center justify-center"
          aria-label="Select color"
        >
          <div 
            className="w-5 h-5 rounded-full transition-transform group-hover:scale-110"
            style={{ backgroundColor: color }}
          />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 glass-panel animate-scale-in"
        align="center"
      >
        <div className="space-y-4">
          <div className="mb-3 space-y-1.5">
            <div className="w-full h-10 rounded-md mb-2" style={{ backgroundColor: color }} />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Color</span>
              <span className="text-xs font-mono">{color.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className={cn(
                  "color-swatch",
                  color === c && "ring-2 ring-primary ring-offset-2"
                )}
                style={{ backgroundColor: c, boxShadow: c === "#FFFFFF" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : undefined }}
                onClick={() => onChange(c)}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
