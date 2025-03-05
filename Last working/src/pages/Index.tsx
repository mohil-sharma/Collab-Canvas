
import { Canvas } from "@/components/canvas/Canvas";
import { Header } from "@/components/layout/Header";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Canvas />
      </main>
      <footer className="p-2 text-center text-xs text-muted-foreground">
        <p>
          Collaborative Drawing Platform • Real-time canvas • 
          <Link to="/about" className="ml-1 text-primary hover:underline">About</Link>
        </p>
      </footer>
    </div>
  );
};

export default Index;
