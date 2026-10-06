import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  showPresets?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  showPresets = true,
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handlePresetSelect = (value: string) => {
    const today = new Date();
    let newDate: Date | undefined;

    switch (value) {
      case "today":
        newDate = today;
        break;
      case "tomorrow":
        newDate = new Date(today);
        newDate.setDate(today.getDate() + 1);
        break;
      case "next-week":
        newDate = new Date(today);
        newDate.setDate(today.getDate() + 7);
        break;
      case "next-month":
        newDate = new Date(today);
        newDate.setMonth(today.getMonth() + 1);
        break;
      case "custom":
        // Keep current date, user will pick from calendar
        return;
      default:
        newDate = undefined;
    }

    handleDateSelect(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-2 p-3">
          {showPresets && (
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Quick select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="next-week">Next Week</SelectItem>
                <SelectItem value="next-month">Next Month</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder?: string;
  className?: string;
  showPresets?: boolean;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Pick a date range",
  className,
  showPresets = true,
}: DateRangePickerProps) {
  const [range, setRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>(
    dateRange || { from: undefined, to: undefined }
  );

  const handleRangeSelect = (newRange: { from: Date | undefined; to: Date | undefined }) => {
    setRange(newRange);
    onDateRangeChange?.(newRange);
  };

  const handlePresetSelect = (value: string) => {
    const today = new Date();
    let newRange: { from: Date | undefined; to: Date | undefined };

    switch (value) {
      case "today":
        newRange = { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      case "last-7-days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        newRange = { from: last7Days, to: today };
        break;
      case "last-30-days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        newRange = { from: last30Days, to: today };
        break;
      case "this-month":
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        newRange = { from: firstDayOfMonth, to: today };
        break;
      case "last-month":
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        newRange = { from: firstDayOfLastMonth, to: lastDayOfLastMonth };
        break;
      case "custom":
        // Keep current range, user will pick from calendar
        return;
      default:
        newRange = { from: undefined, to: undefined };
    }

    handleRangeSelect(newRange);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !range.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range.from ? (
            range.to ? (
              <>
                {format(range.from, "LLL dd, y")} - {format(range.to, "LLL dd, y")}
              </>
            ) : (
              format(range.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-2 p-3">
          {showPresets && (
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Quick select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Calendar
            mode="range"
            selected={range}
            onSelect={(newRange) => {
              if (newRange) {
                handleRangeSelect({ from: newRange.from, to: newRange.to });
              } else {
                handleRangeSelect({ from: undefined, to: undefined });
              }
            }}
            initialFocus
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

