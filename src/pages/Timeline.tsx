import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";

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
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const courses = [
    { code: "all", name: "All Courses" },
    { code: "IF1220", name: "Matematika Diskrit" },
    { code: "IF2120", name: "Probabilitas dan Statistik" },
    { code: "IF2123", name: "Aljabar Linear dan Geometri" },
    { code: "IF2211", name: "Strategi Algoritma" },
    { code: "IF2224", name: "Teori Bahasa Formal dan Otomata" },
  ];

  // Sample events data
  const allEvents: CourseEvent[] = [
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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
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
              />
            </div>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            <p>Click on any event to view more details</p>
          </div>
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
