
import { Button } from "@/components/ui/button";
import { Share, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const handleSave = () => {
    // Simulate saving the canvas
    toast.promise(
      // This would normally be an API call
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Saving your drawing...',
        success: 'Canvas saved successfully!',
        error: 'Failed to save canvas',
      }
    );
  };

  const handleShare = () => {
    // Generate a shareable link (in a real app, this would create a unique URL)
    const shareableLink = window.location.href;
    
    // Copy link to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const handleExportAsPNG = () => {
    // Trigger the export functionality from the canvas
    const event = new CustomEvent('export-canvas', { detail: { format: 'png' } });
    window.dispatchEvent(event);
  };

  const handleExportAsSVG = () => {
    // Simulate SVG export (would be implemented in a full version)
    toast.info("SVG export coming soon!");
  };

  return (
    <header className="w-full px-6 py-3 flex items-center justify-between glass-panel animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">Canvas</span>
          <h1 className="text-lg font-medium">Untitled Drawing</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium border-2 border-background">
            You
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={handleShare}
          >
            <Share size={16} className="mr-1" />
            Share
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
              >
                <Save size={16} className="mr-1" />
                Save
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-panel animate-scale-in">
              <DropdownMenuLabel>Save Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSave}>
                Save to Cloud
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAsPNG}>
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAsSVG}>
                Export as SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
