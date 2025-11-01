import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ListTodo, Calendar } from "lucide-react";
import TaskTracker from "@/components/assistant/TaskTracker";
import InteractiveCalendar from "@/components/assistant/InteractiveCalendar";
import { Toaster } from "@/components/ui/toaster";

// Halaman ini akan menjadi pusat kendali bagi asisten
// Ini mengasumsikan Anda akan melindungi rute ini
// menggunakan Clerk <SignedIn> dan pemeriksaan role.

const AssistantDashboard = () => {
  return (
    <>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-primary">
                Assistant Dashboard
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage tasks and schedule important lab events.
              </p>
            </div>

            <Card className="p-6">
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 h-auto md:h-10 gap-2 md:gap-0">
                  <TabsTrigger value="tasks" className="text-sm md:text-base">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Task Tracker
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="text-sm md:text-base">
                    <Calendar className="mr-2 h-4 w-4" />
                    Event Calendar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="mt-6">
                  <TaskTracker />
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                  <InteractiveCalendar />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default AssistantDashboard;
