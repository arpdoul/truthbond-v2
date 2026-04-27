"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { CONTRACT_ADDRESS, getTotalClaims, getClaimById } from "@/lib/contracts/TruthBond";
import type { Claim } from "@/lib/contracts/types";

export function useClaims() {
  return useQuery({
    queryKey: ["truthbond-claims"],
    queryFn: async (): Promise<Claim[]> => {
      const total = await getTotalClaims();
      if (total === 0) return [];
      const count = Math.min(total, 20);
      const ids = Array.from({ length: count }, (_, i) => total - 1 - i);
      const results = await Promise.allSettled(ids.map(getClaimById));
      return results
        .filter(
          (r): r is PromiseFulfilledResult<Claim> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function useStats() {
  const { data: claims = [] } = useClaims();
  return {
    total: claims.length,
    fake: claims.filter((c) => c.verdict === "FAKE").length,
    real: claims.filter((c) => c.verdict === "REAL").length,
    pending: claims.filter((c) => c.status === "pending").length,
  };
}

export function useSubmitClaim() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleUrl: string) => {
      if (!address) throw new Error("Connect your wallet first");
      if (!articleUrl.startsWith("http"))
        throw new Error("Enter a valid URL starting with http");

      toast.loading("Submitting claim...", { id: "submit" });

      const { getClient } = await import("@/lib/genlayer/client");
      const client = await getClient();
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "submit_claim",
        args: [articleUrl],
      });

      toast.loading("Waiting for AI consensus (3-8 min)...", { id: "submit" });
      return txHash;
    },
    onSuccess: () => {
      toast.success("Claim submitted! AI validators are analyzing...", {
        id: "submit",
      });
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["truthbond-claims"] }),
        10000
      );
    },
    onError: (err: Error) => {
      toast.error(err.message, { id: "submit" });
    },
  });
}

export function useVerifyClaim() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: number) => {
      if (!address) throw new Error("Connect your wallet first");
      const { getClient } = await import("@/lib/genlayer/client");
      const client = await getClient();
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "verify_claim",
        args: [claimId],
      });
      return txHash;
    },
    onSuccess: () => {
      toast.success("Verdict requested! Check back in a few minutes.");
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["truthbond-claims"] }),
        10000
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
