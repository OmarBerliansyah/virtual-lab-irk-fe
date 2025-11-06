import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, Plus, Edit, Trash2, Lock } from "lucide-react";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useTasks } from "@/hooks/use-api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PhotoUpload } from "@/components/ui/photo-upload";

interface CourseEvent {
  id: string;
  title: string;
  start: string;
  course: string;
  type: "deadline" | "release" | "assessment" | "highlight";
  description?: string;
  photoUrl?: string;
  linkAttachments?: Array<{
    title: string;
    url: string;
  }>;
  backgroundColor?: string;
  borderColor?: string;
}

const Timeline = () => {
  const { isSignedIn } = useAuth();
  const { user, loading: profileLoading } = useUserProfile();
  
  const isAssistant = user?.role === 'assistant';
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  
  // Everyone can access timeline, but only assistants/admins can manage events
  const canAccessTimeline = isSignedIn;
  const canManageEvents = isSignedIn && (isAssistant || isAdmin);

  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  
  const { data: apiEvents, isLoading: eventsLoading, error: eventsError } = useEvents(
    selectedCourse === "all" ? undefined : selectedCourse
  );
  
  // Fetch tasks for assistants and admins
  const { data: apiTasks, isLoading: tasksLoading, error: tasksError } = useTasks();
  
  // Combined loading state
  const isLoading = eventsLoading || tasksLoading;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CourseEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CourseEvent | null>(null);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    start: string;
    course: string;
    type: "deadline" | "release" | "assessment" | "highlight";
    description?: string;
    photoUrl?: string;
    linkAttachments?: Array<{
      title: string;
      url: string;
    }>;
  }>({ 
    title: "", 
    start: "", 
    course: "IF2120", 
    type: "deadline",
    description: "",
    photoUrl: "",
    linkAttachments: []
  });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const courses = [
    { code: "all", name: "All Courses" },
    ...(isAssistant || isAdmin ? [{ code: "Tasks", name: "📋 Tasks" }] : []),
    { code: "IF1220", name: "Matematika Diskrit" },
    { code: "IF2120", name: "Probabilitas dan Statistik" },
    { code: "IF2123", name: "Aljabar Linear dan Geometri" },
    { code: "IF2211", name: "Strategi Algoritma" },
    { code: "IF2224", name: "Teori Bahasa Formal dan Otomata" },
  ];

  const eventCourses = [
    { code: "none", name: "None" },
    ...courses.filter(c => c.code !== 'all')
  ];

  // Combine events and tasks into calendar items
  const allCalendarItems: CourseEvent[] = [];
  
  // Add events if available
  if (apiEvents && !eventsError) {
    const eventItems = apiEvents.map(event => ({
      id: event._id,
      title: event.title,
      start: event.start,
      course: event.course,
      type: event.type,
      description: event.description,
      photoUrl: event.photoUrl,
      linkAttachments: event.linkAttachments,
    }));
    allCalendarItems.push(...eventItems);
  }
  
  // Add tasks as calendar events for assistants and admins
  if (apiTasks && !tasksError && (isAssistant || isAdmin)) {
    const taskItems = apiTasks
      .filter(task => task.dueDate) // Only tasks with due dates
      .map(task => ({
        id: `task-${task._id}`,
        title: `📋 ${task.title}`,
        start: task.dueDate!,
        course: "Tasks", // Use a special course category for tasks
        type: "deadline" as const,
        description: task.description || `Task: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}`,
        backgroundColor: task.priority === 'high' ? 'hsl(0, 84%, 60%)' : 
                        task.priority === 'medium' ? 'hsl(31, 92%, 57%)' : 'hsl(120, 60%, 50%)',
        borderColor: task.priority === 'high' ? 'hsl(0, 84%, 60%)' : 
                     task.priority === 'medium' ? 'hsl(31, 92%, 57%)' : 'hsl(120, 60%, 50%)',
      }));
    allCalendarItems.push(...taskItems);
  }
  
  const allEvents = allCalendarItems;

  const getEventColor = (type: string) => {
    switch (type) {
      case "deadline":
        return { background: "hsl(0 84% 60%)", border: "hsl(0 84% 50%)" };
      case "release":
        return { background: "hsl(184 77% 44%)", border: "hsl(184 77% 34%)" };
      case "assessment":
        return { background: "hsl(31 92% 57%)", border: "hsl(31 92% 47%)" };
      case "highlight":
        return { background: "hsl(120 60% 50%)", border: "hsl(120 60% 40%)" };
      default:
        return { background: "hsl(217 91% 25%)", border: "hsl(217 91% 20%)" };
    }
  };

  const filteredEvents = allEvents
    .filter((event) => selectedCourse === "all" || event.course === selectedCourse)
    .map((event) => {
      const colors = getEventColor(event.type);
      return {
        ...event,
        backgroundColor: colors.background,
        borderColor: colors.border,
      };
    });

  const handleDateClick = (clickInfo: DateClickArg) => {
    if (!canManageEvents) return;

    setEditingEvent(null);
    setNewEvent({ 
      title: "", 
      start: clickInfo.dateStr, 
      course: "none", 
      type: "deadline",
      description: "",
      photoUrl: "",
      linkAttachments: []
    });
    setIsModalOpen(true);
  }

  const handleEditEvent = (event: CourseEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      start: event.start,
      course: event.course,
      type: event.type,
      description: event.description || "",
      photoUrl: event.photoUrl || "",
      linkAttachments: event.linkAttachments || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEventMutation.mutateAsync(eventId);
      toast({ 
        title: "Event Deleted", 
        description: "Event has been removed from the calendar." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to delete event. Please try again." 
      });
    }
  };

  // Fungsi submit (menggunakan API)
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start) {
      toast({ 
        variant: "destructive", 
        title: "Missing fields", 
        description: "Title and date are required." 
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingEvent) {
        // Update existing event
        const updateData: {
          title: string;
          start: string;
          course: string;
          type: "deadline" | "release" | "assessment" | "highlight";
          description?: string;
          photoUrl?: string;
          linkAttachments?: Array<{ title: string; url: string }>;
        } = {
          title: newEvent.title,
          start: newEvent.start,
          course: newEvent.course,
          type: newEvent.type,
        };
        
        // Add highlight-specific fields if type is highlight
        if (newEvent.type === "highlight") {
          if (newEvent.description) updateData.description = newEvent.description;
          if (newEvent.photoUrl) updateData.photoUrl = newEvent.photoUrl;
          if (newEvent.linkAttachments && newEvent.linkAttachments.length > 0) {
            updateData.linkAttachments = newEvent.linkAttachments.filter(link => link.title && link.url);
          }
        }
        
        await updateEventMutation.mutateAsync({
          id: editingEvent.id,
          event: updateData
        });
        toast({ 
          title: "Event Updated", 
          description: "Event has been updated successfully." 
        });
      } else {
        // Create new event
        const eventData: {
          title: string;
          start: string;
          course: string | null;
          type: "deadline" | "release" | "assessment" | "highlight";
          description?: string;
          photoUrl?: string;
          linkAttachments?: Array<{ title: string; url: string }>;
        } = {
          title: newEvent.title,
          start: newEvent.start,
          course: newEvent.course,
          type: newEvent.type,
        };
        
        // Add highlight-specific fields if type is highlight
        if (newEvent.type === "highlight") {
          if (newEvent.description) eventData.description = newEvent.description;
          if (newEvent.photoUrl) eventData.photoUrl = newEvent.photoUrl;
          if (newEvent.linkAttachments && newEvent.linkAttachments.length > 0) {
            eventData.linkAttachments = newEvent.linkAttachments.filter(link => link.title && link.url);
          }
        }
        
        await createEventMutation.mutateAsync(eventData);
        toast({ 
          title: "Event Created", 
          description: "New event added to the calendar." 
        });
      }
      
      setIsModalOpen(false);
      setEditingEvent(null);
      setNewEvent({ 
        title: "", 
        start: "", 
        course: "none", 
        type: "deadline",
        description: "",
        photoUrl: "",
        linkAttachments: []
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: `Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show access control for users without permission
  if (!isSignedIn) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Access Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the academic timeline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // No access restriction needed - everyone can view timeline

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading calendar data...</span>
            </div>
          )}

          {/* Error State */}
          {(eventsError || tasksError) && (
            <Alert className="mb-6">
              <AlertDescription>
                Failed to load some calendar data. 
                {eventsError && " Events unavailable."}
                {tasksError && " Tasks unavailable."}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-8">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4 text-primary">Academic Calendar & Tasks</h1>
            <p className="text-muted-foreground">
              Track important dates, deadlines, assessments, and manage tasks for all courses
            </p>
            <p className="text-sm text-primary mt-2">
              {isAdmin ? 'Administrator Access' : isAssistant ? 'Assistant Access' : 'User Access'} • 
              {canManageEvents ? 'Full Event Management Available' : 'View Only Access'}
              {(isAssistant || isAdmin) && ' • Tasks Integration Enabled'}
            </p>
          </div>

          {/* Event Management Section for Assistants */}
          {canManageEvents && (
            <div className="flex justify-end mb-6">
              <Button 
              onClick={() => {
                setEditingEvent(null);
                setNewEvent({ 
                title: "", 
                start: "", 
                course: "none", 
                type: "deadline",
                description: "",
                photoUrl: "",
                linkAttachments: []
                });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
              >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
              </Button>
            </div>
          )}

          <Card className="p-3 sm:p-6 mb-6">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Filter by Course
                </label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.code} value={course.code}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0 84% 60%)" }} />
                  <span>Deadline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(184 77% 44%)" }} />
                  <span>Release</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(31 92% 57%)" }} />
                  <span>Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120 60% 50%)" }} />
                  <span>Highlight</span>
                </div>
                {(isAssistant || isAdmin) && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 via-orange-500 to-green-500" />
                    <span>Tasks (by priority)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="calendar-container overflow-x-auto">
              <style>{`
                .fc .fc-toolbar {
                  flex-wrap: wrap;
                  gap: 0.5rem;
                }
                .fc .fc-toolbar-chunk {
                  display: flex;
                  align-items: center;
                  flex-wrap: wrap;
                  gap: 0.25rem;
                }
                @media (max-width: 640px) {
                  .fc .fc-toolbar {
                    flex-direction: column;
                    align-items: center;
                  }
                  .fc .fc-toolbar-chunk {
                    justify-content: center;
                  }
                  .fc .fc-button-group .fc-button {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                  }
                  .fc .fc-daygrid-day-number {
                    font-size: 0.75rem;
                  }
                  .fc .fc-event-title {
                    font-size: 0.75rem;
                  }
                }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={filteredEvents}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: window.innerWidth > 768 ? "dayGridMonth,dayGridWeek" : "today",
                }}
                height="auto"
                eventClick={(info) => {
                  const event: CourseEvent = {
                    id: info.event.id,
                    title: info.event.title,
                    start: info.event.startStr,
                    course: info.event.extendedProps.course,
                    type: info.event.extendedProps.type,
                    description: info.event.extendedProps.description,
                    photoUrl: info.event.extendedProps.photoUrl,
                    linkAttachments: info.event.extendedProps.linkAttachments,
                  };
                  setViewingEvent(event);
                }}
                dateClick={canManageEvents ? handleDateClick : undefined}
                selectable={canManageEvents}
              />
            </div>
          </Card>

            <div className="text-sm text-muted-foreground text-center">
            <p>Click on any event to view more details</p>
            {canManageEvents && <p>Click on any date to add a new event</p>}
          </div>

          {/* Event View Modal */}
          <Dialog open={!!viewingEvent} onOpenChange={(open) => !open && setViewingEvent(null)}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Event Details
                </DialogTitle>
              </DialogHeader>
              {viewingEvent && (
                <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">{viewingEvent.title}</h3>
                          <p className="text-sm text-muted-foreground">{viewingEvent.course}</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-sm">{new Date(viewingEvent.start).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            viewingEvent.type === 'deadline' ? 'bg-red-100 text-red-800' :
                            viewingEvent.type === 'release' ? 'bg-blue-100 text-blue-800' :
                            viewingEvent.type === 'assessment' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {viewingEvent.type.charAt(0).toUpperCase() + viewingEvent.type.slice(1)}
                          </span>
                        </div>
                        
                        {/* Highlight-specific content */}
                        {viewingEvent.type === 'highlight' && (
                          <>
                            {viewingEvent.description && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {viewingEvent.description}
                                </p>
                              </div>
                            )}
                            
                            {viewingEvent.photoUrl && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Photo</h4>
                                <img 
                                  src={viewingEvent.photoUrl} 
                                  alt="Event photo" 
                                  className="w-full max-w-md rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {viewingEvent.linkAttachments && viewingEvent.linkAttachments.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Links</h4>
                                <div className="space-y-2">
                                  {viewingEvent.linkAttachments.map((link, index) => (
                                    <a 
                                      key={index}
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      <span>🔗</span>
                                      {link.title}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {canManageEvents && (
                    <DialogFooter className="flex gap-2">
                      <Button variant="outline" onClick={() => setViewingEvent(null)}>
                        Close
                      </Button>
                      <Button 
                        onClick={() => {
                          handleEditEvent(viewingEvent);
                          setViewingEvent(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </Button>
                    </DialogFooter>
                  )}
                  
                  {!canManageEvents && (
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setViewingEvent(null)}>
                        Close
                      </Button>
                    </DialogFooter>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {canManageEvents && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Calendar Event' : 'Add New Calendar Event'}
                  </DialogTitle>
                  <DialogDescription>
                    This event will be visible to all students.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input 
                      id="title" 
                      value={newEvent.title} 
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} 
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      max="3020-12-31"
                      value={newEvent.start} 
                      onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} 
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course" className="text-right">Course</Label>
                    <Select 
                      value={newEvent.course} 
                      onValueChange={(val: string) => setNewEvent({...newEvent, course: val})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCourses.map((course) => (
                          <SelectItem key={course.code} value={course.code}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(val) => setNewEvent({...newEvent, type: val as "deadline" | "release" | "assessment" | "highlight"})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="release">Release</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                        <SelectItem value="highlight">Highlight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Highlight-specific fields */}
                  {newEvent.type === "highlight" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <textarea 
                          id="description" 
                          value={newEvent.description || ""} 
                          onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} 
                          className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe the highlight event..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Photo</Label>
                        <div className="col-span-3">
                          <PhotoUpload
                            currentPhotoUrl={newEvent.photoUrl || ""}
                            onPhotoChange={(photoUrl) => setNewEvent({...newEvent, photoUrl})}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Link Attachments</Label>
                        <div className="col-span-3 space-y-2">
                          {newEvent.linkAttachments?.map((link, index) => (
                            <div key={index} className="flex gap-2">
                              <Input 
                                value={link.title} 
                                onChange={(e) => {
                                  const updated = [...(newEvent.linkAttachments || [])];
                                  updated[index] = { ...updated[index], title: e.target.value };
                                  setNewEvent({...newEvent, linkAttachments: updated});
                                }} 
                                placeholder="Link title"
                                className="flex-1"
                              />
                              <Input 
                                value={link.url} 
                                onChange={(e) => {
                                  const updated = [...(newEvent.linkAttachments || [])];
                                  updated[index] = { ...updated[index], url: e.target.value };
                                  setNewEvent({...newEvent, linkAttachments: updated});
                                }} 
                                placeholder="https://example.com"
                                className="flex-1"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const updated = newEvent.linkAttachments?.filter((_, i) => i !== index) || [];
                                  setNewEvent({...newEvent, linkAttachments: updated});
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const updated = [...(newEvent.linkAttachments || []), { title: "", url: "" }];
                              setNewEvent({...newEvent, linkAttachments: updated});
                            }}
                          >
                            Add Link
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingEvent(null);
                    }} 
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingEvent ? 'Update Event' : 'Save Event'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Tampilkan pesan jika tidak login */}
          {!isSignedIn && (
            <Alert className="mt-6">
              <AlertDescription>
                Please <b>sign in</b> to view the complete academic calendar with your personalized events.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <style>{`
        .calendar-container .fc {
          --fc-border-color: hsl(var(--border));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-today-bg-color: hsl(var(--secondary) / 0.1);
        }

        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: hsl(var(--border));
        }

        .calendar-container .fc-daygrid-day-number {
          color: hsl(var(--foreground));
        }

        .calendar-container .fc-col-header-cell-cushion {
          color: hsl(var(--foreground));
          font-weight: 600;
        }

        .calendar-container .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.875rem;
        }

        .calendar-container .fc-event:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
