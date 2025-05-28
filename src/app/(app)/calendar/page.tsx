"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarView from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("month");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevious = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (selectedView === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (selectedView === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (selectedView === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (selectedView === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getViewTitle = () => {
    if (selectedView === "month") {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (selectedView === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${currentDate.getFullYear()}`;
      } else {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${currentDate.getFullYear()}`;
      }
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 bg-muted/20">
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl space-y-6">
            {/* Calendar Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
              <p className="text-muted-foreground">
                Manage your schedule and events
              </p>
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  className="border-border cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToday}
                  className="border-border text-foreground cursor-pointer"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="border-border cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </Button>
                <h2 className="text-xl font-semibold text-foreground">
                  {getViewTitle()}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Tabs
                  value={selectedView}
                  onValueChange={setSelectedView}
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="month" className="gap-2">
                      <Grid className="h-4 w-4" />
                      <span className="hidden sm:inline cursor-pointer">
                        Month
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="week" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="hidden sm:inline cursor-pointer">
                        Week
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="day" className="gap-2">
                      <List className="h-4 w-4" />
                      <span className="hidden sm:inline cursor-pointer">
                        Day
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-background rounded-lg border shadow overflow-hidden">
              <CalendarView view={selectedView} currentDate={currentDate} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
