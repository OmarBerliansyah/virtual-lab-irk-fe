import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CourseEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  course: string;
  type: "deadline" | "release" | "assessment";
  backgroundColor?: string;
  borderColor?: string;
}

// Sample data mata kuliah (bisa juga di-fetch dari API)
const courses = [
  { code: "all", name: "All Courses" },
  { code: "IF1220", name: "Matematika Diskrit" },
  { code: "IF2120", name: "Probabilitas dan Statistik" },
  { code: "IF2123", name: "Aljabar Linear dan Geometri" },
  { code: "IF2211", name: "Strategi Algoritma" },
  { code: "IF2224", name: "Teori Bahasa Formal dan Otomata" },
];

// Sample events data (akan diganti dengan API)
const sampleEvents: CourseEvent[] = [
  // (Data event yang sama seperti di Timeline.tsx Anda)
  { id: "1", title: "Assignment 1: Sorting", start: "2025-11-10", course: "IF1220", type: "deadline" },
  { id: "2", title: "Midterm Exam", start: "2025-11-15", course: "IF1220", type: "assessment" },
  { id: "3", title: "Lab 3 Release", start: "2025-11-08", course: "IF2123", type: "release" },
];

const getEventColor = (type: string) => {
  switch (type) {
    case "deadline": return { background: "hsl(0 84% 60%)", border: "hsl(0 84% 50%)" };
    case "release": return { background: "hsl(184 77% 44%)", border: "hsl(184 77% 34%)" };
    case "assessment": return { background: "hsl(31 92% 57%)", border: "hsl(31 92% 47%)" };
    default: return { background: "hsl(217 91% 25%)", border: "hsl(217 91% 20%)" };
  }
};

const InteractiveCalendar = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [allEvents, setAllEvents] = useState<CourseEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", course: "IF2120", type: "deadline" as const });
  const { toast } = useToast();

  // Fetch events from API on mount
  useEffect(() => {
    setIsLoading(true);
    // TODO: Ganti ini dengan fetch API
    // fetch('/api/events')
    //   .then(res => res.json())
    //   .then(data => setAllEvents(data.events))
    //   .finally(() => setIsLoading(false));
    
    // Mock API call
    setTimeout(() => {
      setAllEvents(sampleEvents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredEvents = allEvents
    .filter((event) => selectedCourse === "all" || event.course === selectedCourse)
    .map((event) => ({
      ...event,
      ...getEventColor(event.type),
    }));

  // Membuka modal saat tanggal diklik
  const handleDateClick = (clickInfo: DateClickArg) => {
    // TODO: Cek role asisten di sini menggunakan hook Clerk
    // const { user } = useUser();
    // if (user.publicMetadata.role !== 'assistant') return;
    
    setNewEvent({ ...newEvent, start: clickInfo.dateStr });
    setIsModalOpen(true);
  };

  // Submit event baru ke backend
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title and date are required." });
      return;
    }
    
    setIsSubmitting(true);
    // TODO: Ganti ini dengan fetch API POST
    // await fetch('/api/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newEvent)
    // });

    // Mock API call
    await new Promise(res => setTimeout(res, 500));
    const newEventWithId = { ...newEvent, id: (Math.random() * 1000).toString() };
    setAllEvents([...allEvents, newEventWithId]);
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewEvent({ title: "", start: "", course: "IF2120", type: "deadline" });
    toast({ title: "Event Created", description: "New event added to the calendar." });
  };

  return (
    <div className="space-y-6">
       <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <Label>Filter by Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-64 mt-2">
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
             {/* Legenda warna... */}
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={getEventColor("deadline")}/><span>Deadline</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={getEventColor("release")}/><span>Release</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={getEventColor("assessment")}/><span>Assessment</span></div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
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
              dateClick={handleDateClick} // Memungkinkan klik tanggal
              selectable={true}
            />
          </div>
        )}
      </Card>
      
      <Alert>
        <AlertDescription>
          <strong>Assistant Feature:</strong> Click on any date to add a new event (deadline, release, etc.) for students.
        </AlertDescription>
      </Alert>
        
      {/* Modal untuk menambah event baru */}
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
              <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={newEvent.start} onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">Course</Label>
              <Select value={newEvent.course} onValueChange={(val: string) => setNewEvent({...newEvent, course: val})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courses.filter(c => c.code !== 'all').map((course) => (
                    <SelectItem key={course.code} value={course.code}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={newEvent.type} onValueChange={(val: string) => setNewEvent({...newEvent, type: val as "deadline" | "release" | "assessment"})}>
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddEvent} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diperlukan untuk gaya kalender kustom */}
      <style>{`
        .calendar-container .fc { --fc-border-color: hsl(var(--border)); ... }
        /* (Salin sisa gaya dari file Timeline.tsx asli Anda) */
      `}</style>
    </div>
  );
};

export default InteractiveCalendar;
