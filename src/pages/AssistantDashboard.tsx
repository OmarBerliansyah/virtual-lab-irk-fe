import { Card } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import TaskTracker from "@/components/assistant/TaskTracker";
import { Toaster } from "@/components/ui/toaster";

// Assistant Dashboard - Now only contains Task Tracker
// Calendar functionality moved to Timeline page with role-based access

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
                Manage your tasks and track progress. For calendar and events, visit the Timeline page.
              </p>
            </div>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <TaskTracker />
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default AssistantDashboard;
