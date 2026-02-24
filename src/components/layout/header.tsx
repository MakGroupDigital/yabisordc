"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";


export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = (
    <>
      <Link href="/#destinations" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
        Destinations
      </Link>
      <Link href="#" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
        Hôtels
      </Link>
      <Link href="#" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
        Contact
      </Link>
    </>
  );

  const logo = (
    <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
      <Image
        src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
        alt="Ya Biso RDC Logo"
        width={32}
        height={32}
        className="rounded-full object-cover"
      />
    </div>
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-sm shadow-md border-b"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          {logo}
          <span className="text-xl font-bold font-headline tracking-tight text-foreground">
            Ya Biso RDC
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks}
          <Button>Connexion</Button>
        </nav>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-2">
                    {logo}
                    <span className="text-xl font-bold font-headline tracking-tight text-foreground">Ya Biso RDC</span>
                </div>
                <nav className="flex flex-col gap-4">
                    {navLinks}
                </nav>
                <Button className="w-full">Connexion</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
