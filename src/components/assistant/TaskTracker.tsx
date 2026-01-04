import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Calendar, Clock, User, Trash2, Edit, Info, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-api";
import { useAssistants, type Assistant } from "@/hooks/useAssistants";
import { Task as ApiTask } from "@/types/api";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "To Do" | "In Progress" | "Done";
  dueDate?: string;
  assignee?: string;
  assistantId?: string;
  tags: string[];
  createdAt: string;
  version?: number;
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

const TaskTracker = () => {
  const { toast } = useToast();
  const { data: apiTasks, isLoading, error } = useTasks();
  const { data: assistants, isLoading: isLoadingAssistants } = useAssistants();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Convert API tasks to local format
  const convertApiTaskToLocal = (apiTask: ApiTask): Task => ({
    id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description || "",
    priority: apiTask.priority || "medium",
    status: apiTask.status || "To Do",
    dueDate: apiTask.dueDate,
    assignee: apiTask.assignee,
    assistantId: apiTask.assistantId,
    tags: apiTask.tags || [],
    createdAt: apiTask.createdAt,
    version: apiTask.version,
  });

  // Initialize task board data from API
  const initializeTaskBoard = (tasks: Task[]): TaskBoardData => {
    const taskMap: { [key: string]: Task } = {};
    const todoTasks: string[] = [];
    const inProgressTasks: string[] = [];
    const doneTasks: string[] = [];

    tasks.forEach(task => {
      taskMap[task.id] = task;
      if (task.status === "To Do") todoTasks.push(task.id);
      else if (task.status === "In Progress") inProgressTasks.push(task.id);
      else if (task.status === "Done") doneTasks.push(task.id);
    });

    return {
      tasks: taskMap,
      columns: {
        "column-1": { id: "column-1", title: "To Do", taskIds: todoTasks },
        "column-2": { id: "column-2", title: "In Progress", taskIds: inProgressTasks },
        "column-3": { id: "column-3", title: "Done", taskIds: doneTasks },
      },
      columnOrder: ["column-1", "column-2", "column-3"],
    };
  };

  // Fallback data for when API is loading/failed
  const fallbackData: TaskBoardData = {
    tasks: {
      "task-1": {
        id: "task-1",
        title: "Setup Project Structure",
        description: "Initialize the project with proper folder structure and dependencies",
        priority: "high",
        status: "To Do",
        dueDate: "2025-11-15",
        assignee: "Assistant",
        assistantId: "assistant-1",
        tags: ["setup", "backend"],
        createdAt: "2025-11-01"
      },
    },
    columns: {
      "column-1": { id: "column-1", title: "To Do", taskIds: ["task-1"] },
      "column-2": { id: "column-2", title: "In Progress", taskIds: [] },
      "column-3": { id: "column-3", title: "Done", taskIds: [] },
    },
    columnOrder: ["column-1", "column-2", "column-3"],
  };

  const [data, setData] = useState<TaskBoardData>(fallbackData);

  // Update local state when API data changes
  useEffect(() => {
    if (apiTasks) {
      const localTasks = apiTasks.map(convertApiTaskToLocal);
      const newData = initializeTaskBoard(localTasks);
      setData(newData);
    }
  }, [apiTasks]);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignee: "",
    assistantId: "",
    tags: []
  });

  useEffect(() => {
    if (editingTask) {
      setNewTask({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
        assignee: editingTask.assignee,
        assistantId: editingTask.assistantId,
        tags: editingTask.tags
      });
    }
  }, [editingTask]);

  const updateTask = () => {
    if (!editingTask) return;
    
    if (!newTask.title?.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title is required",
      });
      return;
    }

    if (!newTask.assistantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Assignee (Assistant) is required",
      });
      return;
    }

    const selectedAssistantName = getAssistantName(newTask.assistantId) || newTask.assignee || "";

    if (newTask.status === "Done" && editingTask.dueDate) {
      const dueDate = new Date(editingTask.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        const confirmOverdue = confirm(
          "This task is overdue. Are you sure you want to mark it as done?"
        );
        if (!confirmOverdue) return;
      }
    }

    if (newTask.priority === "high" && !newTask.assignee?.trim()) {
      toast({
        variant: "destructive",
        title: "Constraint Violation",
        description: "High priority tasks must have an assignee",
      });
      return;
    }

    updateTaskMutation.mutate({
      id: editingTask.id,
      task: {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as "low" | "medium" | "high",
        status: newTask.status as "To Do" | "In Progress" | "Done",
        dueDate: newTask.dueDate,
        assignee: selectedAssistantName,
        assistantId: newTask.assistantId,
        tags: newTask.tags || [],
        version: editingTask.version ?? 0,
      }
    }, {
      onSuccess: (updatedApiTask) => {
        const updatedLocalTask = convertApiTaskToLocal(updatedApiTask);
        
        setData(prevData => ({
          ...prevData,
          tasks: {
            ...prevData.tasks,
            [editingTask.id]: updatedLocalTask
          }
        }));

        toast({
          title: "Task Updated",
          description: "Task has been updated successfully",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update task. Please try again.",
        });
      }
    });

    setEditingTask(null);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assignee: "",
      assistantId: "",
      tags: []
    });
  };

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

    const task = data.tasks[draggableId];
    const newStatus = finish.title as "To Do" | "In Progress" | "Done";

    // 1. UPDATE STATE LOKAL SEKALIGUS (Atomic Update)
    // Kita update posisi kolom DAN status task dalam satu kali setData
    // agar React merender UI yang konsisten dalam satu frame.
    setData((prevData) => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      },
      tasks: {
        ...prevData.tasks,
        [draggableId]: {
          ...task,
          status: newStatus // Update status langsung di sini
        }
      }
    }));

    // 2. Update via API (Optimistic Update sudah dilakukan di atas)
    if (task) {
      updateTaskMutation.mutate({
        id: task.id,
        task: {
          ...task,
          status: newStatus,
          version: task.version ?? 0,
        }
      }, {
        onError: () => {
          // Opsional: Revert state jika API gagal (Rollback logic bisa ditambahkan disini)
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Failed to move task.",
          });
        }
      });
    }

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

    if (!newTask.assistantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Assignee (Assistant) is required",
      });
      return;
    }

    const selectedAssistantName = getAssistantName(newTask.assistantId) || newTask.assignee || "";

    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description || "",
      priority: newTask.priority as "low" | "medium" | "high",
      status: "To Do",
      dueDate: newTask.dueDate,
      assignee: selectedAssistantName,
      assistantId: newTask.assistantId!,
      tags: newTask.tags || [],
    }, {
      onSuccess: (createdTask) => {
        const localTask = convertApiTaskToLocal(createdTask);
        
        const newTasks = {
          ...data.tasks,
          [localTask.id]: localTask
        };

        const todoColumn = data.columns["column-1"];
        const newTodoColumn = {
          ...todoColumn,
          taskIds: [...todoColumn.taskIds, localTask.id]
        };

        setData({
          ...data,
          tasks: newTasks,
          columns: {
            ...data.columns,
            [newTodoColumn.id]: newTodoColumn
          }
        });

        toast({
          title: "Task Created",
          description: "Task has been created successfully",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create task. Please try again.",
        });
      }
    });

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assignee: "",
      assistantId: "",
      tags: []
    });
    setIsAddingTask(false);

    toast({
      title: "Task Added",
      description: "New task has been added to To Do column",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => {
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
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete task. Please try again.",
        });
      }
    });
  };

  const getAssistantName = (id?: string) => {
    if (!id || !Array.isArray(assistants)) return "";
    const found = assistants.find((assistant: Assistant) => assistant._id === id);
    return found?.name ?? "";
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
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tasks...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert>
          <AlertDescription>
            Failed to load tasks from API. Showing fallback content.
          </AlertDescription>
        </Alert>
      )}

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
                    min={new Date().toISOString().split("T")[0]}
                    max="3020-12-31"
                    value={newTask.dueDate || ""}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="assignee">Assignee <span className="text-red-500">*</span></Label>
                <Select
                  value={newTask.assistantId || ""}
                  onValueChange={(value) => {
                    const name = getAssistantName(value);
                    setNewTask({ ...newTask, assistantId: value, assignee: name });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingAssistants ? (
                      <div className="p-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                    ) : (
                      assistants?.map((assistant: Assistant) => (
                        <SelectItem key={assistant._id} value={assistant._id}>
                          {assistant.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

            return (
              <div key={column.id} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-semibold text-base md:text-lg">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[250px] md:min-h-[300px] p-3 rounded-lg border-2 border-dashed ${
                        snapshot.isDraggingOver 
                          ? "border-primary bg-primary/5" 
                          : "border-muted-foreground/20 hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="space-y-2 md:space-y-3">
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-move transition-all duration-200 w-full ${
                                  snapshot.isDragging ? "shadow-lg rotate-1 scale-105" : "hover:shadow-md hover:scale-[1.02]"
                                }`}
                              >
                                <CardHeader className="pb-3 px-4 pt-4">
                                  <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-sm font-semibold line-clamp-2 flex-1 min-w-0">
                                      {task.title}
                                    </CardTitle>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
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
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 opacity-60 hover:opacity-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTask(task.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0 px-4 pb-4 space-y-3">
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-1.5">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    {task.tags.slice(0, 3).map((tag, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{task.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex flex-wrap items-center gap-3">
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">{new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {task.assignee && (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate max-w-[80px]">{task.assignee}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Clock className="h-3 w-3" />
                                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
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

      <Dialog open={!!editingTask} onOpenChange={(open) => {
        if (!open) {
          setEditingTask(null);
          setNewTask({
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
            assignee: "",
            assistantId: "",
            tags: []
          });
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">Title *</Label>
              <Input
                id="edit-title"
                value={newTask.title || editingTask?.title || ""}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="col-span-3"
                placeholder="Task title..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Textarea
                id="edit-description"
                value={newTask.description || editingTask?.description || ""}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
                placeholder="Task description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">Priority</Label>
              <select
                id="edit-priority"
                value={newTask.priority || editingTask?.priority || "medium"}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <select
                id="edit-status"
                value={newTask.status || editingTask?.status || "To Do"}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as "To Do" | "In Progress" | "Done" })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dueDate" className="text-right">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                max="3020-12-31"
                value={newTask.dueDate || editingTask?.dueDate || ""}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assignee" className="text-right">
                Assignee <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <Select
                  value={newTask.assistantId || editingTask?.assistantId || ""}
                  onValueChange={(value) => {
                    const name = getAssistantName(value);
                    setNewTask({ ...newTask, assistantId: value, assignee: name });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingAssistants ? (
                      <div className="p-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                    ) : (
                      assistants?.map((assistant: Assistant) => (
                        <SelectItem key={assistant._id} value={assistant._id}>
                          {assistant.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={updateTask}>
              {updateTaskMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTracker;
