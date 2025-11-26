import Image from "next/image"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BentoCardProps {
  imageUrl: string
  imageHint: string
  title: string
  subtitle: string
  className?: string
}

export function BentoCard({ imageUrl, imageHint, title, subtitle, className }: BentoCardProps) {
  return (
    <Card className={cn(
      "group relative cursor-pointer overflow-hidden rounded-2xl border-none shadow-lg transform-gpu transition-transform duration-300 ease-in-out hover:scale-105",
      className
    )}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
        data-ai-hint={imageHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="font-headline text-2xl font-bold">{title}</h3>
        <p className="text-white/80">{subtitle}</p>
      </div>
    </Card>
  )
}
