"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const backgroundImageUrl = "https://res.cloudinary.com/dy73hzkpm/image/upload/v1764157528/vue-aerienne-de-drone-du-centre-ville-de-chisinau-vue-panoramique-sur-plusieurs-routes-de-batiments_wxyx5w.jpg";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home/explorer");
      } else {
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isCheckingAuth) {
    return null; // Or a custom loader, but GlobalLoader in layout handles the initial visual load
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Image de fallback pour le SEO et l'accessibilité */}
      <Image
        src={backgroundImageUrl}
        alt="Vue aérienne de la ville"
        fill
        className="z-0 object-cover opacity-0"
        data-ai-hint="city aerial"
        priority
        sizes="100vw"
        unoptimized={false}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />
      <div className="relative z-20 w-full flex justify-center">
        <OnboardingWizard />
      </div>
    </div>
  );
}

