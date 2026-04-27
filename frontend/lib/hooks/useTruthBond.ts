"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { CONTRACT_ADDRESS, getTruthBondClient, getTotalClaims, getClaim } from "@/lib/contracts/TruthBond";
import type { Claim } from "@/lib/contracts/types";

export function useClaims() {
  return useQuery({
    queryKey: ["claims"],
    queryFn: async (): Promise<Claim[]> => {
      const total = await getTotalClaims();
      if (total === 0) return [];
      const ids = Array.from({ length: Math.min(total, 20) }, (_, i) => total - 1 - i);
      const results = await Promise.allSettled(ids.map(getClaim));
      return results
        .filter((r): r is PromiseFulfilledResult<Claim> => r.status === "fulfilled" && r.value !== null)
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
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleUrl: string) => {
      if (!address || !walletClient) throw new Error("Connect your wallet first");
      if (!articleUrl.startsWith("http")) throw new Error("Enter a valid URL");

      const client = getTruthBondClient(address);
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "submit_claim",
        args: [articleUrl],
        account: address,
      });

      toast.loading("Waiting for AI consensus...", { id: "submit" });

      await client.waitForTransactionReceipt({
        hash: txHash,
        retries: 60,
        interval: 8000,
      });

      return txHash;
    },
    onSuccess: (txHash) => {
      toast.success("Claim submitted! AI validators are analyzing...", { id: "submit" });
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["claims"] }), 5000);
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
      const client = getTruthBondClient(address);
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "verify_claim",
        args: [claimId],
        account: address,
      });
      await client.waitForTransactionReceipt({ hash: txHash, retries: 60, interval: 8000 });
      return txHash;
    },
    onSuccess: () => {
      toast.success("Verdict recorded on-chain!");
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
