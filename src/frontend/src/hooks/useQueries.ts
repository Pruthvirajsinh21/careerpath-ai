import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Job, Message, UserProfile, UserRole } from "../backend.d";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJobList() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["jobList"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMatchingJobs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["matchingJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMatchingJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useConversationHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["conversationHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConversationHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      role,
      bio,
    }: { name: string; role: UserRole; bio: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createUserProfile(name, role, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      interests,
      skills,
      personalityTraits,
      workStylePreferences,
    }: {
      interests: string[];
      skills: string[];
      personalityTraits: string[];
      workStylePreferences: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateUserProfile(
        interests,
        skills,
        personalityTraits,
        workStylePreferences,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["matchingJobs"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: Message) => {
      if (!actor) throw new Error("No actor");
      return actor.addMessage(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversationHistory"] });
    },
  });
}

export function useSeedJobs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedJobs();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobList"] });
      queryClient.invalidateQueries({ queryKey: ["matchingJobs"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
