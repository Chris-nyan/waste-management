import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// --- DayContent component to render the event dots ---
function DayContent(props) {
  const { date, activeModifiers } = props
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      <span>{date.getDate()}</span>
      {activeModifiers.event && (
        <div className="absolute bottom-1.5 flex space-x-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
      )}
    </div>
  )
}

export function ScheduleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center text-lg font-medium",
        caption_label: "text-lg font-bold text-gray-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-4",
        head_row: "flex",
        head_cell: "text-slate-500 rounded-md w-full font-normal text-sm",
        row: "flex w-full mt-2",
        cell: "w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-12 w-full p-0 font-normal rounded-lg transition-all"),
        day_selected: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-95 focus:opacity-95 shadow-lg",
        day_today: "bg-emerald-100 text-primary font-bold",
        day_outside: "text-slate-400 opacity-50",
        day_disabled: "text-slate-400 opacity-40 cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        DayContent: DayContent,
      }}
      {...props} />
  )
}
ScheduleCalendar.displayName = "ScheduleCalendar"

