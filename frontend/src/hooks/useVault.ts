import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vaultApi } from "@/services/vault.api";

export function useVaultEntries() {
  return useQuery({
    queryKey: ["vault"],
    queryFn: () => vaultApi.list(),
  });
}

export function useVaultEntry(pattern: string) {
  return useQuery({
    queryKey: ["vault", pattern],
    queryFn: () => vaultApi.get(pattern),
    enabled: !!pattern,
  });
}

export function useUpdateVaultEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pattern, content }: { pattern: string; content: string }) =>
      vaultApi.update(pattern, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vault", data.pattern] });
      queryClient.invalidateQueries({ queryKey: ["vault"] });
    },
  });
}

export function useVaultLinkedProblems(pattern: string) {
  return useQuery({
    queryKey: ["vault", pattern, "problems"],
    queryFn: () => vaultApi.getLinkedProblems(pattern),
    enabled: !!pattern,
  });
}

export function useDraftVaultEntry() {
  return useMutation({
    mutationFn: (pattern: string) => vaultApi.draft(pattern),
  });
}
