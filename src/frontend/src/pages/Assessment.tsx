import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateUserProfile } from "../hooks/useQueries";

interface AssessmentProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Your Interests",
    description: "Select the fields that interest you the most",
    key: "interests" as const,
    options: [
      "Technology",
      "Healthcare",
      "Business",
      "Arts",
      "Science",
      "Education",
      "Finance",
      "Engineering",
      "Design",
      "Marketing",
      "Law",
      "Social Work",
      "Sports",
      "Environment",
      "Media",
    ],
  },
  {
    id: 2,
    title: "Your Skills",
    description: "Pick the skills you have or want to develop",
    key: "skills" as const,
    options: [
      "Programming",
      "Communication",
      "Leadership",
      "Problem Solving",
      "Data Analysis",
      "Creative Writing",
      "Teaching",
      "Research",
      "Project Management",
      "Customer Service",
      "Sales",
      "Design",
      "Mathematics",
      "Critical Thinking",
      "Teamwork",
    ],
  },
  {
    id: 3,
    title: "Personality Traits",
    description: "Choose traits that best describe you",
    key: "personalityTraits" as const,
    options: [
      "Analytical",
      "Creative",
      "Organized",
      "Empathetic",
      "Ambitious",
      "Detail-oriented",
      "Collaborative",
      "Independent",
      "Adaptable",
      "Curious",
    ],
  },
  {
    id: 4,
    title: "Work Style",
    description: "What kind of work environment suits you?",
    key: "workStylePreferences" as const,
    options: [
      "Remote work",
      "Office environment",
      "Flexible hours",
      "Fixed schedule",
      "Team-based",
      "Solo work",
      "Fast-paced",
      "Steady pace",
      "Travel involved",
      "Outdoor work",
    ],
  },
];

type AssessmentData = {
  interests: string[];
  skills: string[];
  personalityTraits: string[];
  workStylePreferences: string[];
};

export default function Assessment({ onComplete }: AssessmentProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AssessmentData>({
    interests: [],
    skills: [],
    personalityTraits: [],
    workStylePreferences: [],
  });
  const [completed, setCompleted] = useState(false);
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();

  const currentStep = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  const toggleOption = (option: string) => {
    setData((prev) => {
      const key = currentStep.key;
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  const handleNext = () => {
    if (data[currentStep.key].length === 0) {
      toast.error("Please select at least one option");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      updateProfile(data, {
        onSuccess: () => {
          setCompleted(true);
          setTimeout(() => onComplete(), 2000);
        },
        onError: () =>
          toast.error("Failed to save assessment. Please try again."),
      });
    }
  };

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">
            Assessment Complete!
          </h2>
          <p className="text-muted-foreground">
            Great! We're finding your best career matches...
          </p>
          <div className="mt-6">
            <Progress value={100} className="h-2" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-display font-bold">
            Personal Assessment
          </h1>
          <span className="text-sm text-muted-foreground font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress
          value={progress}
          className="h-2"
          data-ocid="assessment.progress.card"
        />
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "text-xs font-medium",
                i <= step ? "text-accent" : "text-muted-foreground",
              )}
            >
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">
                {currentStep.title}
              </CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentStep.options.map((option) => {
                  const selected = data[currentStep.key].includes(option);
                  return (
                    <button
                      type="button"
                      key={option}
                      data-ocid="assessment.option.toggle"
                      onClick={() => toggleOption(option)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                        selected
                          ? "border-accent bg-accent text-white"
                          : "border-border bg-card text-foreground hover:border-accent/60 hover:bg-secondary",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {data[currentStep.key].length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {data[currentStep.key].length} selected:{" "}
                  {data[currentStep.key].join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          data-ocid="assessment.back.button"
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 w-4 h-4" /> Back
        </Button>
        <Button
          data-ocid="assessment.next.primary_button"
          onClick={handleNext}
          disabled={isPending}
          className="gradient-card text-white border-0 hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : step === STEPS.length - 1 ? (
            <>
              Complete <CheckCircle className="ml-2 w-4 h-4" />
            </>
          ) : (
            <>
              Next <ChevronRight className="ml-1 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
