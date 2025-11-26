'use client';

import Image from "next/image";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers /home après un court délai ou après onboarding
    // Pour l'instant, redirection directe
    const timer = setTimeout(() => {
      router.push('/home');
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex size-full flex-col items-center justify-center bg-background p-4">
      <Image
        src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764157528/vue-aerienne-de-drone-du-centre-ville-de-chisinau-vue-panoramique-sur-plusieurs-routes-de-batiments_wxyx5w.jpg"
        alt="Vue aérienne de la ville"
        fill
        className="z-0 object-cover"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/30 z-10" />
      <div className="z-20 w-full flex justify-center">
        <OnboardingWizard />
      </div>
    </div>
  );
}

    