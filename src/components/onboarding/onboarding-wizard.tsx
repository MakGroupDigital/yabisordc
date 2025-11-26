"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Wallet,
  Sparkles,
  Users,
  Mountain,
  Building,
  Plane,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type TravelStyle = "Aventure" | "Détente" | "Culturel" | "Luxueux";
type TravelerType = "Seul" | "Couple" | "Famille" | "Amis";
type Interest = "Nature" | "Histoire" | "Gastronomie" | "Art";

const totalSteps = 4;

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [travelerType, setTravelerType] = useState<TravelerType | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleFinish = () => {
    // Here you would typically save the user's preferences
    console.log("Onboarding complete:", { travelStyles, travelerType, interests });
    router.push("/home");
  };

  const nextStep = () => {
    if (step === totalSteps) {
      handleFinish();
    } else {
      setStep((s) => Math.min(s + 1, totalSteps + 1));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const toggleSelection = <T,>(
    selection: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    item: T
  ) => {
    if (selection.includes(item)) {
      setter(selection.filter((i) => i !== item));
    } else {
      setter([...selection, item]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepLayout title="Bienvenue sur Ya Biso RDC !">
            <p className="text-center text-white">
              Commençons par quelques questions pour personnaliser votre
              expérience de voyage au Congo.
            </p>
            <div className="w-full text-center mt-8">
                 <Button onClick={nextStep} size="lg">
                    Commencer
                </Button>
            </div>
          </StepLayout>
        );
      case 2:
        return (
          <StepLayout title="Quel est votre style de voyage ?">
            <div className="grid grid-cols-2 gap-4">
              <SelectableCard
                icon={<Mountain />}
                label="Aventure"
                isSelected={travelStyles.includes("Aventure")}
                onClick={() =>
                  toggleSelection(travelStyles, setTravelStyles, "Aventure")
                }
              />
              <SelectableCard
                icon={<Plane className="rotate-45" />}
                label="Détente"
                isSelected={travelStyles.includes("Détente")}
                onClick={() =>
                  toggleSelection(travelStyles, setTravelStyles, "Détente")
                }
              />
              <SelectableCard
                icon={<Palette />}
                label="Culturel"
                isSelected={travelStyles.includes("Culturel")}
                onClick={() =>
                  toggleSelection(travelStyles, setTravelStyles, "Culturel")
                }
              />
              <SelectableCard
                icon={<Building />}
                label="Luxueux"
                isSelected={travelStyles.includes("Luxueux")}
                onClick={() =>
                  toggleSelection(travelStyles, setTravelStyles, "Luxueux")
                }
              />
            </div>
          </StepLayout>
        );
      case 3:
        return (
          <StepLayout title="Avec qui voyagez-vous ?">
            <div className="grid grid-cols-2 gap-4">
              <SelectableCard
                icon={<User />}
                label="Seul"
                isSelected={travelerType === "Seul"}
                onClick={() => setTravelerType("Seul")}
              />
              <SelectableCard
                icon={<Heart />}
                label="Couple"
                isSelected={travelerType === "Couple"}
                onClick={() => setTravelerType("Couple")}
              />
              <SelectableCard
                icon={<Users />}
                label="Famille"
                isSelected={travelerType === "Famille"}
                onClick={() => setTravelerType("Famille")}
              />
              <SelectableCard
                icon={<Users />}
                label="Amis"
                isSelected={travelerType === "Amis"}
                onClick={() => setTravelerType("Amis")}
              />
            </div>
          </StepLayout>
        );
      case 4:
        return (
          <StepLayout title="Quels sont vos centres d'intérêt ?">
            <div className="grid grid-cols-2 gap-4">
               <SelectableCard
                icon={<Mountain />}
                label="Nature"
                isSelected={interests.includes("Nature")}
                onClick={() =>
                  toggleSelection(interests, setInterests, "Nature")
                }
              />
              <SelectableCard
                icon={<Building />}
                label="Histoire"
                isSelected={interests.includes("Histoire")}
                onClick={() =>
                  toggleSelection(interests, setInterests, "Histoire")
                }
              />
              <SelectableCard
                icon={<Plane />}
                label="Gastronomie"
                isSelected={interests.includes("Gastronomie")}
                onClick={() =>
                  toggleSelection(interests, setInterests, "Gastronomie")
                }
              />
              <SelectableCard
                icon={<Palette />}
                label="Art"
                isSelected={interests.includes("Art")}
                onClick={() => toggleSelection(interests, setInterests, "Art")}
              />
            </div>
          </StepLayout>
        );
      default:
        return null;
    }
  };

  const progress = ((step -1) / totalSteps) * 100;

  return (
    <Card className="w-full max-w-2xl shadow-2xl bg-black/30 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex justify-center items-center mb-4">
            <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center bg-white border-4 border-primary/20 shadow-md">
                <Image
                    src="https://res.cloudinary.com/dy73hzkpm/image/upload/v1764155959/IMG_7775_cxdvvm.png"
                    alt="Ya Biso RDC Logo"
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                />
            </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col justify-between"
          >
            {renderStep()}
            {step > 1 && (
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="text-white">
                  Précédent
                </Button>
                {step <= totalSteps && (
                  <Button onClick={nextStep}>
                    {step === totalSteps ? "Terminer" : "Suivant"}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function StepLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-8 text-center font-headline text-3xl font-bold text-white">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SelectableCard({
  icon,
  label,
  isSelected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border-2 p-6 text-center transition-all duration-200 text-white",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-white/20 bg-white/10 hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-6 w-6 text-primary",
        })}
      </div>
      <p className="mt-4 font-semibold">{label}</p>
    </div>
  );
}
