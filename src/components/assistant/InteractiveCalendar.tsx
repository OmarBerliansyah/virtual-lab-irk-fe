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
import { Label } from "@/components/ui/label";
import { Calendar as Loader2 } from "lucide-react";
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
      
      {/* Diperlukan untuk gaya kalender kustom */}
      <style>{`
        .calendar-container .fc { --fc-border-color: hsl(var(--border)); ... }
        /* (Salin sisa gaya dari file Timeline.tsx asli Anda) */
      `}</style>
    </div>
  );
};

export default InteractiveCalendar;
