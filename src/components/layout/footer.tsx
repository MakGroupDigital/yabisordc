import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-12 md:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-white">
            <Image
              src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
              alt="Ya Biso RDC Logo"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          </div>
          <span className="text-xl font-bold font-headline">Ya Biso RDC</span>
        </div>
        <p className="text-sm text-secondary-foreground/70">
          © {new Date().getFullYear()} Ya Biso RDC. Tous droits réservés.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground">Termes</Link>
          <Link href="#" className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
