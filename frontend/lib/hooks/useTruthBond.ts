"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useWallet } from "@/lib/genlayer/wallet";
import { getContractAddress, getStudioUrl } from "@/lib/genlayer/client";
import TruthBond from "@/lib/contracts/TruthBond";
import { toast } from "sonner";
import type { Claim } from "@/lib/contracts/types";

function useTruthBondContract(): TruthBond | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const rpcUrl = getStudioUrl();

  return useMemo(() => {
    if (!contractAddress) return null;
    return new TruthBond(contractAddress, address, rpcUrl);
  }, [contractAddress, address, rpcUrl]);
}

export function useClaims() {
  const contract = useTruthBondContract();

  return useQuery<Claim[], Error>({
    queryKey: ["truthbond-claims"],
    queryFn: async (): Promise<Claim[]> => {
      if (!contract) return [];
      const total = await contract.getTotalClaims();
      if (total === 0) return [];
      const count = Math.min(total, 20);
      const ids = Array.from({ length: count }, (_, i) => total - 1 - i);
      const results = await Promise.allSettled(ids.map((id) => contract.getClaim(id)));
      return results
        .filter(
          (r): r is PromiseFulfilledResult<Claim> =>
            r.status === "fulfilled" && r.value !== null
        )
        .map((r) => r.value);
    },
    refetchOnWindowFocus: true,
    staleTime: 10000,
    enabled: !!contract,
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
  const contract = useTruthBondContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleUrl: string) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Connect your wallet first");
      if (!articleUrl.startsWith("http"))
        throw new Error("Enter a valid URL starting with http");
      toast.loading("Submitting claim...", { id: "submit" });
      const txHash = await contract.submitClaim(articleUrl);
      toast.loading("Waiting for AI consensus (3-8 min)...", { id: "submit" });
      return txHash;
    },
    onSuccess: () => {
      toast.success("Claim submitted! AI validators are analyzing...", {
        id: "submit",
      });
      queryClient.invalidateQueries({ queryKey: ["truthbond-claims"] });
    },
    onError: (err: Error) => {
      toast.error(err.message, { id: "submit" });
    },
  });
}

export function useVerifyClaim() {
  const contract = useTruthBondContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: number) => {
      if (!contract) throw new Error("Contract not configured");
      if (!address) throw new Error("Connect your wallet first");
      const txHash = await contract.verifyClaim(claimId);
      return txHash;
    },
    onSuccess: () => {
      toast.success("Verdict requested! Check back in a few minutes.");
      queryClient.invalidateQueries({ queryKey: ["truthbond-claims"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
