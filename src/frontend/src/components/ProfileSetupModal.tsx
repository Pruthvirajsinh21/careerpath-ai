import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useCreateUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [bio, setBio] = useState("");
  const { mutate: createProfile, isPending } = useCreateUserProfile();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!role) {
      toast.error("Please select your role");
      return;
    }
    createProfile(
      { name: name.trim(), role, bio: bio.trim() },
      {
        onError: () =>
          toast.error("Failed to create profile. Please try again."),
      },
    );
  };

  const roleOptions = [
    {
      value: UserRole.student,
      icon: GraduationCap,
      label: "Student",
      desc: "Exploring career options",
    },
    {
      value: UserRole.employee,
      icon: Briefcase,
      label: "Professional",
      desc: "Looking for growth",
    },
  ];

  return (
    <Dialog open={open}>
      <DialogContent
        data-ocid="profile_setup.dialog"
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Tell us about yourself to personalize your career guidance
            experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              data-ocid="profile_setup.input"
              placeholder="e.g., Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  data-ocid={`profile_setup.${r.value}.toggle`}
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    role === r.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50",
                  )}
                >
                  <r.icon
                    className={cn(
                      "w-7 h-7",
                      role === r.value
                        ? "text-accent"
                        : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      role === r.value ? "text-accent" : "text-foreground",
                    )}
                  >
                    {r.label}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">
              Short Bio{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="profile-bio"
              data-ocid="profile_setup.textarea"
              placeholder="Tell us a bit about yourself, your background, or career goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            data-ocid="profile_setup.submit_button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full gradient-card text-white border-0 hover:opacity-90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
