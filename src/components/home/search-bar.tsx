"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="mt-8 flex w-full max-w-3xl flex-col gap-4 rounded-xl bg-background/20 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:p-2 border border-white/20">
      <div className="relative w-full sm:flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Kinshasa, Parc des Virunga..."
          className="h-14 pl-10 text-base bg-background/50 border-0 focus-visible:ring-primary"
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "h-14 w-full sm:flex-1 justify-start text-left font-normal bg-background/50 border-0 hover:bg-background/70 focus:bg-background/70",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={fr}
          />
        </PopoverContent>
      </Popover>
      <Button size="lg" className="h-14 text-base w-full sm:w-auto px-8 font-bold">Explorer</Button>
    </div>
  )
}
