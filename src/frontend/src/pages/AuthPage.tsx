import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const STATS = [
  { value: "10K+", label: "Users Guided" },
  { value: "500+", label: "Job Matches" },
  { value: "95%", label: "Satisfaction" },
];

type SignInValues = { email: string; password: string };
type SignUpValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AuthPage() {
  const { registerWithCredentials, loginWithCredentials, isLoggingIn } =
    useInternetIdentity();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const signIn = useForm<SignInValues>({
    defaultValues: { email: "", password: "" },
  });

  const signUp = useForm<SignUpValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const features = [
    {
      icon: Briefcase,
      title: "Career Guidance",
      desc: "Personalized career advice tailored to your profile",
    },
    {
      icon: TrendingUp,
      title: "Job Matching",
      desc: "AI-powered job recommendations based on your skills",
    },
    {
      icon: MessageSquare,
      title: "AI Career Chat",
      desc: "Chat with your AI career advisor anytime",
    },
    {
      icon: Shield,
      title: "Personal Assessment",
      desc: "Discover your strengths and ideal career paths",
    },
  ];

  const handleTabChange = (val: string) => {
    setActiveTab(val as "signin" | "signup");
    setFormError(undefined);
    signIn.clearErrors();
    signUp.clearErrors();
  };

  const onSignIn = signIn.handleSubmit(async (data) => {
    setFormError(undefined);
    try {
      await loginWithCredentials(data.email, data.password);
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Invalid email or password",
      );
    }
  });

  const onSignUp = signUp.handleSubmit(async (data) => {
    setFormError(undefined);
    try {
      await registerWithCredentials(data.username, data.email, data.password);
    } catch (e) {
      setFormError(
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again.",
      );
    }
  });

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl">
              CareerPath AI
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
              Navigate Your
              <br />
              Career Journey
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              AI-powered guidance to help students and professionals discover
              their ideal career path.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <f.icon className="w-5 h-5 text-white/80 mb-2" />
              <p className="text-white font-semibold text-sm">{f.title}</p>
              <p className="text-white/60 text-xs mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              {activeTab === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "signin"
                ? "Sign in to continue your career journey"
                : "Start your personalized career journey today"}
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList
              data-ocid="auth.tab"
              className="grid w-full grid-cols-2 mb-6"
            >
              <TabsTrigger data-ocid="auth.signin_tab" value="signin">
                Sign In
              </TabsTrigger>
              <TabsTrigger data-ocid="auth.signup_tab" value="signup">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Global form error */}
            {formError && (
              <div
                data-ocid="auth.error_state"
                className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
              >
                {formError}
              </div>
            )}

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-5" noValidate>
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      data-ocid="auth.input"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...signIn.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />
                  </div>
                  {signIn.formState.errors.email && (
                    <p
                      data-ocid="auth.email_error"
                      className="text-destructive text-xs mt-1"
                    >
                      {signIn.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      data-ocid="auth.password_input"
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...signIn.register("password", {
                        required: "Password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signIn.formState.errors.password && (
                    <p
                      data-ocid="auth.password_error"
                      className="text-destructive text-xs mt-1"
                    >
                      {signIn.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  data-ocid="auth.submit_button"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 text-base font-semibold gradient-card text-white border-0 hover:opacity-90 transition-opacity"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    data-ocid="auth.signup_link"
                    onClick={() => handleTabChange("signup")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={onSignUp} className="space-y-4" noValidate>
                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      data-ocid="auth.username_input"
                      type="text"
                      placeholder="johndoe"
                      className="pl-10"
                      {...signUp.register("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters",
                        },
                      })}
                    />
                  </div>
                  {signUp.formState.errors.username && (
                    <p
                      data-ocid="auth.username_error"
                      className="text-destructive text-xs mt-1"
                    >
                      {signUp.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      data-ocid="auth.email_input"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...signUp.register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />
                  </div>
                  {signUp.formState.errors.email && (
                    <p
                      data-ocid="auth.signup_email_error"
                      className="text-destructive text-xs mt-1"
                    >
                      {signUp.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      data-ocid="auth.signup_password_input"
                      type={showSignUpPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      className="pl-10 pr-10"
                      {...signUp.register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signUp.formState.errors.password && (
                    <p
                      data-ocid="auth.signup_password_error"
                      className="text-destructive text-xs mt-1"
                    >
                      {signUp.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      data-ocid="auth.confirm_password_input"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className="pl-10 pr-10"
                      {...signUp.register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) =>
                          val === signUp.getValues("password") ||
                          "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signUp.formState.errors.confirmPassword && (
                    <p
                      data-ocid="auth.confirm_password_error"
                      className="text-destructive text-xs mt-1"
                    >
                      {signUp.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  data-ocid="auth.signup_submit_button"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 text-base font-semibold gradient-card text-white border-0 hover:opacity-90 transition-opacity"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    data-ocid="auth.signin_link"
                    onClick={() => handleTabChange("signin")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {STATS.map((stat) => (
              <div key={stat.value} className="p-4 rounded-xl bg-secondary">
                <p className="text-xl font-display font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
