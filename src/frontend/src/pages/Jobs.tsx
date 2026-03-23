import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ClipboardList, DollarSign, Star, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useJobList, useMatchingJobs, useSeedJobs } from "../hooks/useQueries";
import { useUserProfile } from "../hooks/useQueries";

interface JobsProps {
  onStartAssessment: () => void;
}

export default function Jobs({ onStartAssessment }: JobsProps) {
  const { data: profile } = useUserProfile();
  const { data: matchingJobs, isLoading: matchLoading } = useMatchingJobs();
  const { data: jobList, isLoading: jobListLoading } = useJobList();
  const { mutate: seedJobs } = useSeedJobs();

  const assessmentDone =
    profile && (profile.interests.length > 0 || profile.skills.length > 0);
  const jobs = assessmentDone ? matchingJobs : jobList;
  const isLoading = assessmentDone ? matchLoading : jobListLoading;

  useEffect(() => {
    if (jobList && jobList.length === 0) {
      seedJobs();
    }
  }, [jobList, seedJobs]);

  const getGrowthStyle = (outlook: string) => {
    const o = outlook.toLowerCase();
    if (o === "high")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (o === "medium")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (o === "stable") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-secondary text-muted-foreground border-border";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">
          {assessmentDone ? "Your Job Matches" : "Explore Careers"}
        </h1>
        <p className="text-muted-foreground">
          {assessmentDone
            ? `${jobs?.length ?? 0} positions matched to your profile`
            : "Discover career opportunities. Complete your assessment for personalized matches."}
        </p>
      </div>

      {/* Assessment prompt */}
      {!assessmentDone && (
        <Card
          data-ocid="jobs.assessment_prompt.card"
          className="mb-6 border-accent/30 bg-accent/5"
        >
          <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 rounded-2xl bg-accent/20">
              <ClipboardList className="w-7 h-7 text-accent" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-foreground mb-1">
                Get Personalized Matches
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete your personal assessment to see jobs tailored to your
                interests and skills.
              </p>
            </div>
            <Button
              data-ocid="jobs.start_assessment.primary_button"
              onClick={onStartAssessment}
              className="gradient-card text-white border-0 hover:opacity-90 flex-shrink-0"
            >
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <div
          data-ocid="jobs.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <Card data-ocid="jobs.empty_state" className="p-12 text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">No Jobs Found</h3>
          <p className="text-muted-foreground">
            {assessmentDone
              ? "No matches found for your current profile. Try updating your assessment."
              : "Loading career opportunities..."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((item, i) => {
            const job = "job" in item ? item.job : item;
            const score = "score" in item ? Number(item.score) : null;

            return (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`jobs.list.item.${i + 1}`}
              >
                <Card className="h-full hover:shadow-card-lg transition-all duration-200 hover:-translate-y-0.5">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-bold text-base leading-tight flex-1 pr-2">
                        {job.title}
                      </h3>
                      <Badge
                        className={cn(
                          "text-xs flex-shrink-0",
                          getGrowthStyle(job.growthOutlook),
                        )}
                      >
                        {job.growthOutlook}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-emerald-700">
                          {job.salaryRange}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {job.growthOutlook} growth
                        </span>
                      </div>

                      {job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
                              +{job.requiredSkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {score !== null && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              Match Score
                            </span>
                            <span className="font-bold text-accent">
                              {score}%
                            </span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
