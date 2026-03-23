import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import {
  useJobList,
  useMatchingJobs,
  useUserProfile,
} from "../hooks/useQueries";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: profile } = useUserProfile();
  const { data: matchingJobs, isLoading: jobsLoading } = useMatchingJobs();
  const { data: jobList } = useJobList();

  const assessmentDone =
    profile && (profile.interests.length > 0 || profile.skills.length > 0);

  const topMatches = matchingJobs?.slice(0, 3) || [];

  const getGrowthColor = (outlook: string) => {
    const o = outlook.toLowerCase();
    if (o.includes("excellent")) return "bg-emerald-100 text-emerald-700";
    if (o.includes("good")) return "bg-yellow-100 text-yellow-700";
    return "bg-secondary text-muted-foreground";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-white"
      >
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">
            Welcome back,
          </p>
          <h1 className="text-3xl font-display font-bold mb-2">
            {profile?.name || "Career Explorer"} 👋
          </h1>
          <p className="text-white/80 max-w-md">
            {assessmentDone
              ? "Your personalized career path is ready. Explore your top job matches below."
              : "Complete your assessment to get personalized career recommendations."}
          </p>
          {!assessmentDone && (
            <Button
              data-ocid="dashboard.assessment.primary_button"
              onClick={() => onNavigate("assessment")}
              className="mt-4 bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Start Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <TrendingUp className="w-40 h-40" />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: ClipboardList,
            label: "Assessment",
            value: assessmentDone ? "Completed" : "Not Started",
            sub: assessmentDone ? "View results" : "Take now",
            action: () => onNavigate("assessment"),
            color: assessmentDone ? "text-emerald-600" : "text-amber-600",
            ocid: "dashboard.assessment_card.card",
          },
          {
            icon: Briefcase,
            label: "Job Matches",
            value: matchingJobs?.length ?? "—",
            sub: assessmentDone
              ? "Personalized matches"
              : "Complete assessment",
            action: () => onNavigate("jobs"),
            color: "text-accent",
            ocid: "dashboard.job_matches.card",
          },
          {
            icon: Star,
            label: "Total Jobs",
            value: jobList?.length ?? "—",
            sub: "In our database",
            action: () => onNavigate("jobs"),
            color: "text-primary",
            ocid: "dashboard.total_jobs.card",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Card
              data-ocid={stat.ocid}
              className="cursor-pointer hover:shadow-card transition-shadow"
              onClick={stat.action}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">
                      {stat.label}
                    </p>
                    <p
                      className={`text-2xl font-display font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.sub}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold">Top Job Matches</h2>
          <Button
            data-ocid="dashboard.view_all_jobs.button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("jobs")}
            className="text-accent hover:text-accent"
          >
            View all <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        {!assessmentDone ? (
          <Card
            data-ocid="dashboard.matches.empty_state"
            className="p-8 text-center"
          >
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">No matches yet</p>
            <p className="text-muted-foreground text-sm mb-4">
              Complete your personal assessment to get matched with ideal
              careers.
            </p>
            <Button
              data-ocid="dashboard.start_assessment.button"
              onClick={() => onNavigate("assessment")}
              className="gradient-card text-white border-0"
            >
              Start Assessment
            </Button>
          </Card>
        ) : jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : topMatches.length === 0 ? (
          <Card
            data-ocid="dashboard.matches.empty_state"
            className="p-8 text-center"
          >
            <p className="text-muted-foreground">
              No job matches found. Try updating your assessment.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topMatches.map((match, i) => (
              <motion.div
                key={match.job.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                data-ocid={`dashboard.matches.item.${i + 1}`}
              >
                <Card
                  className="hover:shadow-card transition-shadow cursor-pointer"
                  onClick={() => onNavigate("jobs")}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm leading-tight">
                        {match.job.title}
                      </h3>
                      <Badge
                        className={`text-xs ml-2 flex-shrink-0 ${getGrowthColor(match.job.growthOutlook)}`}
                      >
                        {match.job.growthOutlook}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {match.job.description}
                    </p>
                    <p className="text-xs font-medium text-primary mb-3">
                      {match.job.salaryRange}
                    </p>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Match Score
                        </span>
                        <span className="font-semibold text-accent">
                          {Number(match.score)}%
                        </span>
                      </div>
                      <Progress value={Number(match.score)} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Chat CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-secondary border-0">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 rounded-2xl gradient-card">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display font-bold text-foreground mb-1">
                Chat with Your AI Advisor
              </h3>
              <p className="text-muted-foreground text-sm">
                Get personalized career advice, interview tips, and guidance
                from your AI career coach.
              </p>
            </div>
            <Button
              data-ocid="dashboard.ai_chat.primary_button"
              onClick={() => onNavigate("chat")}
              className="gradient-card text-white border-0 hover:opacity-90 flex-shrink-0"
            >
              Start Chatting <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <footer className="text-center text-xs text-muted-foreground pt-4">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
