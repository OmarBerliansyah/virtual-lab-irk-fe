import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Calendar, Clock, User, Trash2, Edit, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: string;
  tags: string[];
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface TaskBoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}

const initialData: TaskBoardData = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Setup Project Structure",
      description: "Initialize the project with proper folder structure and dependencies",
      priority: "high",
      dueDate: "2025-11-15",
      assignee: "Assistant",
      tags: ["setup", "backend"],
      createdAt: "2025-11-01"
    },
    "task-2": {
      id: "task-2",
      title: "Implement Authentication",
      description: "Add Clerk authentication with role-based access",
      priority: "high",
      tags: ["auth", "security"],
      createdAt: "2025-11-01"
    },
    "task-3": {
      id: "task-3",
      title: "Design Database Schema",
      description: "Create MongoDB schemas for users, tasks, and events",
      priority: "medium",
      tags: ["database", "mongodb"],
      createdAt: "2025-11-01"
    }
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: ["task-1", "task-2"]
    },
    "column-2": {
      id: "column-2",
      title: "In Progress", 
      taskIds: []
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: ["task-3"]
    }
  },
  columnOrder: ["column-1", "column-2", "column-3"]
};

const TaskTracker = () => {
  const [data, setData] = useState<TaskBoardData>(initialData);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignee: "",
    tags: []
  });
  const { toast } = useToast();

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn
        }
      });
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    });

    toast({
      title: "Task Moved",
      description: `Task moved to ${finish.title}`,
    });
  };

  const addTask = () => {
    if (!newTask.title?.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title is required",
      });
      return;
    }

    const taskId = `task-${Date.now()}`;
    const task: Task = {
      id: taskId,
      title: newTask.title,
      description: newTask.description || "",
      priority: newTask.priority as "low" | "medium" | "high",
      dueDate: newTask.dueDate,
      assignee: newTask.assignee,
      tags: newTask.tags || [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newTasks = {
      ...data.tasks,
      [taskId]: task
    };

    const todoColumn = data.columns["column-1"];
    const newTodoColumn = {
      ...todoColumn,
      taskIds: [...todoColumn.taskIds, taskId]
    };

    setData({
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [newTodoColumn.id]: newTodoColumn
      }
    });

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assignee: "",
      tags: []
    });
    setIsAddingTask(false);

    toast({
      title: "Task Added",
      description: "New task has been added to To Do column",
    });
  };

  const deleteTask = (taskId: string) => {
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    const newColumns = { ...data.columns };
    Object.keys(newColumns).forEach(columnId => {
      newColumns[columnId] = {
        ...newColumns[columnId],
        taskIds: newColumns[columnId].taskIds.filter(id => id !== taskId)
      };
    });

    setData({
      ...data,
      tasks: newTasks,
      columns: newColumns
    });

    toast({
      title: "Task Deleted",
      description: "Task has been removed",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Tracker</h2>
          <p className="text-muted-foreground">Manage your lab projects and research tasks</p>
        </div>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newTask.title || ""}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ""}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newTask.priority || "medium"}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate || ""}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee || ""}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  placeholder="Assign to"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                Cancel
              </Button>
              <Button onClick={addTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

            return (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <Badge variant="secondary">{tasks.length}</Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver 
                          ? "border-primary bg-primary/5" 
                          : "border-muted-foreground/20"
                      }`}
                    >
                      <div className="space-y-3">
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-move transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg rotate-1" : "hover:shadow-md"
                                }`}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-sm font-medium line-clamp-2">
                                      {task.title}
                                    </CardTitle>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTask(task);
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteTask(task.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    {task.tags.map((tag, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{task.dueDate}</span>
                                        </div>
                                      )}
                                      {task.assignee && (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          <span>{task.assignee}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{task.createdAt}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Task Management:</strong> Drag and drop tasks between columns to update their status. 
          Tasks with due dates can be integrated with the calendar system for better scheduling.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TaskTracker;
