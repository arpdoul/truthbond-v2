"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Claim } from "./types";

class TruthBond {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(
    contractAddress: string,
    address?: string | null,
    rpcUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    if (rpcUrl) config.endpoint = rpcUrl;
    this.client = createClient(config);
  }

  async getTotalClaims(): Promise<number> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_total_claims",
        args: [],
        // @ts-ignore
        type: "read",
      });
      return Number(result) || 0;
    } catch {
      return 0;
    }
  }

  async getClaim(id: number): Promise<Claim | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_claim",
        args: [id],
        // @ts-ignore
        type: "read",
      });
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      return { id, ...parsed } as Claim;
    } catch {
      return null;
    }
  }

  async submitClaim(articleUrl: string): Promise<`0x${string}`> {
    const txHash: any = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_claim",
      args: [articleUrl],
      // @ts-ignore
      type: "write",
    });
    await this.client.waitForTransactionReceipt({
      hash: txHash,
      retries: 60,
      interval: 8000,
    });
    return txHash;
  }

  async verifyClaim(claimId: number): Promise<`0x${string}`> {
    const txHash: any = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "verify_claim",
      args: [claimId],
      // @ts-ignore
      type: "write",
    });
    await this.client.waitForTransactionReceipt({
      hash: txHash,
      retries: 60,
      interval: 8000,
    });
    return txHash;
  }
}

export default TruthBond;
