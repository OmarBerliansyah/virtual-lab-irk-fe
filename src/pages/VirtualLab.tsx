import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Beaker } from "lucide-react";
import RegexTester from "@/components/lab/RegexTester";
import SLESolver from "@/components/lab/SLESolver";
import PathfindingSimulation from "@/components/lab/PathfindingSimulation";

const VirtualLab = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Beaker className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4 text-primary">Virtual Laboratory</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore powerful computational tools for regex testing, equation solving, and pathfinding algorithms
            </p>
          </div>

          <Card className="p-6">
            <Tabs defaultValue="regex" className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10 gap-2 md:gap-0">
                <TabsTrigger value="regex" className="text-sm md:text-base">
                  Regex Tester
                </TabsTrigger>
                <TabsTrigger value="sle" className="text-sm md:text-base">
                  SLE Solver
                </TabsTrigger>
                <TabsTrigger value="pathfinding" className="text-sm md:text-base">
                  Pathfinding
                </TabsTrigger>
              </TabsList>

              <TabsContent value="regex" className="mt-6">
                <RegexTester />
              </TabsContent>

              <TabsContent value="sle" className="mt-6">
                <SLESolver />
              </TabsContent>

              <TabsContent value="pathfinding" className="mt-6">
                <PathfindingSimulation />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualLab;
