"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import SociusLogo from "@/components/socius-logo";
import { cn } from "@/lib/utils";
import { fetchTasks } from "@/api/get-user-task/route";

interface CalendarViewProps {
  view: string;
  currentDate: Date;
}

type CalendarEvent = {
  id: number;
  taskId: string;
  title: string;
  start: Date;
  end: Date;
  type: "personal";
  description?: string;
};

export default function CalendarView({ view, currentDate }: CalendarViewProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) {
        router.push("/login");
        return;
      }
      try {
        const tasks = await fetchTasks(user.id);
        console.log("Tasks loaded:", tasks); // Ghi log để debug tasks
        const mappedEvents: CalendarEvent[] = tasks
          .map((task, index) => {
            const start = new Date(task.deadline);
            if (isNaN(start.getTime())) {
              console.warn(`Invalid deadline for task ${task.id}: ${task.deadline}`);
              return null;
            }
            // Chuẩn hóa thời gian bắt đầu là 8:00 sáng
            start.setHours(8, 0, 0, 0);

            const end = new Date(start);
            end.setHours(start.getHours() + 1);

            return {
              id: index + 1,
              taskId: task.id,
              title: task.name,
              start,
              end,
              type: "personal",
              description: task.description ?? undefined,
            } as CalendarEvent;
          })
          .filter((event): event is CalendarEvent => event !== null);

        setEvents(mappedEvents);
        setError(null);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError(error instanceof Error ? error.message : "Failed to load tasks");
        toast.error("Failed to load tasks. Please try again.");
        setEvents([]);
      }
    };

    loadTasks();
  }, [user?.id, router]);

  useEffect(() => {
    const days: Date[] = [];
    if (view === "month") {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const firstDayOfWeek = firstDay.getDay();

      for (let i = firstDayOfWeek; i > 0; i--) {
        const prevMonthDay = new Date(firstDay);
        prevMonthDay.setDate(prevMonthDay.getDate() - i);
        days.push(prevMonthDay);
      }

      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      }

      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const nextMonthDay = new Date(lastDay);
        nextMonthDay.setDate(nextMonthDay.getDate() + i);
        days.push(nextMonthDay);
      }
    } else if (view === "week") {
      const firstDayOfWeek = new Date(currentDate);
      const day = firstDayOfWeek.getDay();
      firstDayOfWeek.setDate(currentDate.getDate() - day);

      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(firstDayOfWeek);
        weekDay.setDate(firstDayOfWeek.getDate() + i);
        days.push(weekDay);
      }
    } else if (view === "day") {
      days.push(new Date(currentDate));
    }

    setCalendarDays(days);
  }, [view, currentDate]);

  const getEventsForDay = (day: Date) => {
    const dayEvents = events.filter(
      (event) =>
        event.start.getDate() === day.getDate() &&
        event.start.getMonth() === day.getMonth() &&
        event.start.getFullYear() === day.getFullYear()
    );
    console.log(`Events for day ${day.toDateString()}:`, dayEvents); // Ghi log để debug
    return dayEvents;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (!isAuthenticated) return null;

  if (view === "month") {
    return (
      <div className="flex flex-col bg-background">
        <div className="flex items-center gap-2 p-4">
          <div className="rounded-full bg-primary-50 p-3">
            <SociusLogo className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">My Tasks</h1>
        </div>
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="p-4 text-red-600 bg-red-100 rounded-md">
            Lỗi: {error}
          </div>
        )}
        <div className="grid grid-cols-7 text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div
              key={index}
              className="p-2 text-center font-medium border-b text-foreground"
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] p-1 border-b border-r last:border-r-0",
                  isCurrentMonth(day) ? "bg-background" : "bg-muted/30",
                  isToday(day) && "bg-primary-50/50"
                )}
              >
                <div className="flex items-center justify-between p-2">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      isToday(day) &&
                        "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge className="h-5 px-1 text-xs border-border text-foreground">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="w-full rounded-md border px-2 py-1 text-left text-xs truncate bg-primary-400/10 text-primary-400 border-primary-400/30"
                    >
                      {formatTime(event.start)} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-full text-xs text-muted-foreground text-left pl-2">
                      + {dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === "week") {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    return (
      <div className="flex flex-col bg-background">
        <div className="flex items-center gap-2 p-4">
          <div className="rounded-full bg-primary-50 p-3">
            <SociusLogo className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">My Tasks</h1>
        </div>
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="p-4 text-red-600 bg-red-100 rounded-md">
            Lỗi: {error}
          </div>
        )}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 border-r"></div>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-r last:border-r-0",
                isToday(day) && "bg-primary-50/50 font-medium"
              )}
            >
              <div className="text-xs text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()]}
              </div>
              <div
                className={cn(
                  "mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8">
          <div className="border-r">
            {hours.map((hour, hourIndex) => (
              <div
                key={hourIndex}
                className="h-16 border-b p-1 text-xs text-muted-foreground relative"
              >
                <span className="absolute -top-2 left-2">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? "AM" : "PM"}
                </span>
              </div>
            ))}
          </div>
          {calendarDays.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r last:border-r-0">
              {hours.map((hour, hourIndex) => (
                <div
                  key={hourIndex}
                  className={cn("h-16 border-b", isToday(day) && "bg-primary-50/50")}
                >
                  {getEventsForDay(day).map((event, eventIndex) => {
                    // Hiển thị tất cả sự kiện của ngày, đặt ở đầu khung giờ nếu cần
                    const durationHours =
                      (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                    const heightPercentage = Math.min(durationHours * 100, 100);
                    return (
                      <div
                        key={eventIndex}
                        className="absolute w-[calc(100%-8px)] left-1 rounded-md border p-1 text-xs overflow-hidden bg-primary-400/10 text-primary-400 border-primary-400/30"
                        style={{
                          top: `${(event.start.getMinutes() / 60) * 100}%`,
                          height: `${heightPercentage}%`,
                          maxHeight: `${durationHours * 64}px`,
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <Clock className="h-2.5 w-2.5" />
                          <span>
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "day") {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    return (
      <div className="flex flex-col bg-background">
        <div className="flex items-center gap-2 p-4">
          <div className="rounded-full bg-primary-50 p-3">
            <SociusLogo className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">My Tasks</h1>
        </div>
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="p-4 text-red-600 bg-red-100 rounded-md">
            Lỗi: {error}
          </div>
        )}
        <div className="grid grid-cols-2 border-b">
          <div className="p-2 border-r"></div>
          <div
            className={cn(
              "p-2 text-center",
              isToday(currentDate) && "bg-primary-50/50 font-medium"
            )}
          >
            <div className="text-xs text-muted-foreground">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
                currentDate.getDay()
              ]}
            </div>
            <div
              className={cn(
                "mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm",
                isToday(currentDate) && "bg-primary text-primary-foreground"
              )}
            >
              {currentDate.getDate()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="border-r">
            {hours.map((hour, index) => (
              <div
                key={index}
                className="h-24 border-b p-1 text-xs text-muted-foreground relative"
              >
                <span className="absolute -top-2 left-2">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? "AM" : "PM"}
                </span>
              </div>
            ))}
          </div>
          <div className="relative">
            {hours.map((hour, hourIndex) => (
              <div
                key={hourIndex}
                className={cn(
                  "h-24 border-b",
                  isToday(currentDate) && "bg-primary-50/50"
                )}
              >
                {getEventsForDay(currentDate).map((event, eventIndex) => {
                  // Hiển thị tất cả sự kiện của ngày
                  const durationHours =
                    (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
                  const heightPercentage = Math.min(durationHours * 100, 100);
                  return (
                    <div
                      key={eventIndex}
                      className="absolute w-[calc(100%-8px)] left-1 rounded-md border p-2 text-xs overflow-hidden bg-primary-400/10 text-primary-400 border-primary-400/30"
                      style={{
                        top: `${(event.start.getMinutes() / 60) * 100}%`,
                        height: `${heightPercentage}%`,
                        maxHeight: `${durationHours * 96}px`,
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center gap-1 text-[10px] mt-1">
                        <Clock className="h-2.5 w-2.5" />
                        <span>
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </span>
                      </div>
                      {event.description && (
                        <div className="text-[10px] mt-1 truncate">{event.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}