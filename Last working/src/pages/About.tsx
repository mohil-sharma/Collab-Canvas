
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass-panel m-6 p-6 rounded-lg max-w-3xl mx-auto w-full animate-fade-in">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Canvas
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">About Canvas</h1>
        
        <div className="space-y-4">
          <p>
            Canvas is a collaborative drawing platform that allows multiple users to draw together in real-time. 
            With intuitive tools and a clean interface, it's perfect for brainstorming, teaching, or just having fun.
          </p>
          
          <h2 className="text-xl font-semibold mt-6">Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Real-time drawing with multiple tools</li>
            <li>Shape creation (rectangles, circles)</li>
            <li>Text annotations</li>
            <li>Export your work as PNG</li>
            <li>Clean, minimal interface</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6">Coming Soon</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>User accounts and saved drawings</li>
            <li>More export options (SVG, PDF)</li>
            <li>Collaborative rooms with unique sharing links</li>
            <li>Advanced shape editing and manipulation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
