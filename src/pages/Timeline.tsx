import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useEvents, useCreateEvent } from "@/hooks/use-api";
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

interface CourseEvent {
  id: string;
  title: string;
  start: string;
  course: string;
  type: "deadline" | "release" | "assessment";
  backgroundColor?: string;
  borderColor?: string;
}

const Timeline = () => {
  const { isSignedIn, user } = useUser();
  const isAssistant = user?.publicMetadata?.role === 'assistant';
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  
  // HANYA fetch jika user login
  const { data: apiEvents, isLoading, error } = useEvents(
    selectedCourse === "all" ? undefined : selectedCourse
  );

  // State untuk modal (pindahkan dari InteractiveCalendar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    start: string;
    course: string;
    type: "deadline" | "release" | "assessment";
  }>({ 
    title: "", 
    start: "", 
    course: "IF2120", 
    type: "deadline"
  });

  const createEventMutation = useCreateEvent();

  const courses = [
    { code: "all", name: "All Courses" },
    { code: "IF1220", name: "Matematika Diskrit" },
    { code: "IF2120", name: "Probabilitas dan Statistik" },
    { code: "IF2123", name: "Aljabar Linear dan Geometri" },
    { code: "IF2211", name: "Strategi Algoritma" },
    { code: "IF2224", name: "Teori Bahasa Formal dan Otomata" },
  ];

  // Fallback events data
  const fallbackEvents: CourseEvent[] = [
    {
      id: "1",
      title: "Assignment 1: Sorting Algorithms",
      start: "2025-11-10",
      course: "IF1220",
      type: "deadline",
    },
    {
      id: "2",
      title: "Midterm Exam",
      start: "2025-11-15",
      course: "IF1220",
      type: "assessment",
    },
    {
      id: "3",
      title: "Lab 3: Memory Management",
      start: "2025-11-08",
      course: "IF2123",
      type: "release",
    },
    {
      id: "4",
      title: "Project Proposal Due",
      start: "2025-11-20",
      course: "IF2224",
      type: "deadline",
    },
    {
      id: "5",
      title: "Assignment 2: Network Protocols",
      start: "2025-11-18",
      course: "IF3204",
      type: "deadline",
    },
    {
      id: "6",
      title: "Quiz 2",
      start: "2025-11-12",
      course: "IF3204",
      type: "assessment",
    },
    {
      id: "7",
      title: "Lab 4: Process Scheduling",
      start: "2025-11-25",
      course: "IF3103",
      type: "release",
    },
    {
      id: "8",
      title: "Final Project Presentation",
      start: "2025-12-01",
      course: "IF2101",
      type: "assessment",
    },
  ];

  // Tampilkan event HANYA jika login dan datanya ada
  const allEvents: CourseEvent[] = (apiEvents && !error) 
    ? apiEvents.map(event => ({
        id: event._id,
        title: event.title,
        start: event.start,
        course: event.course,
        type: event.type,
      }))
    : fallbackEvents;

  const getEventColor = (type: string) => {
    switch (type) {
      case "deadline":
        return { background: "hsl(0 84% 60%)", border: "hsl(0 84% 50%)" };
      case "release":
        return { background: "hsl(184 77% 44%)", border: "hsl(184 77% 34%)" };
      case "assessment":
        return { background: "hsl(31 92% 57%)", border: "hsl(31 92% 47%)" };
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
    if (!isAssistant) return;

    setNewEvent({ ...newEvent, start: clickInfo.dateStr });
    setIsModalOpen(true);
  }

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
      await createEventMutation.mutateAsync({
        title: newEvent.title,
        start: newEvent.start,
        course: newEvent.course,
        type: newEvent.type,
      });
      
      setIsModalOpen(false);
      setNewEvent({ title: "", start: "", course: "IF2120", type: "deadline" });
      toast({ 
        title: "Event Created", 
        description: "New event added to the calendar." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to create event. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading events...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert className="mb-6">
              <AlertDescription>
                Failed to load events from API. Showing fallback content.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-8">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4 text-primary">Academic Calendar</h1>
            <p className="text-muted-foreground">
              Track important dates, deadlines, and assessments for all courses
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Filter by Course
                </label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full md:w-64">
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

              <div className="flex gap-4 text-sm">
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
              </div>
            </div>

            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={filteredEvents}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek",
                }}
                height="auto"
                eventClick={(info) => {
                  alert(`Event: ${info.event.title}\nCourse: ${info.event.extendedProps.course}`);
                }}
                dateClick={isAssistant ? handleDateClick : undefined}
                selectable={isAssistant}
              />
            </div>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            <p>Click on any event to view more details</p>
            {isAssistant && <p>Click on any date to add a new event</p>}
          </div>

          {isAssistant && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Calendar Event</DialogTitle>
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
                        {courses.filter(c => c.code !== 'all').map((course) => (
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
                      onValueChange={(val) => setNewEvent({...newEvent, type: val as "deadline" | "release" | "assessment"})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="release">Release</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Event
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
