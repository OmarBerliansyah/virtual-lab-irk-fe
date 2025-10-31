import { useEffect, useState } from "react";
import { Beaker } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade-out animation
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <img src="/LabIRK.svg" alt="VirtualLab Logo" className="h-20 w-20 text-primary opacity-75" />
          </div>
          <img src="/LabIRK.svg" alt="VirtualLab Logo" className="h-20 w-20 text-primary opacity-75" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary animate-fade-in">
            VirtualLab
          </h1>
          <p className="text-muted-foreground animate-fade-in">
            Loading your virtual laboratory...
          </p>
        </div>

        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[slide-in-right_1.5s_ease-in-out]" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
