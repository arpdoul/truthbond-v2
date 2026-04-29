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

    const config: any = {
      chain: studionet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (rpcUrl) {
      config.endpoint = rpcUrl;
    }

    this.client = createClient(config);
  }

  async getTotalClaims(): Promise<number> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_total_claims",
        args: [],
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
      });
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      return { id, ...parsed } as Claim;
    } catch {
      return null;
    }
  }

  async submitClaim(articleUrl: string): Promise<`0x${string}`> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_claim",
      args: [articleUrl],
    });
    await this.client.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      retries: 60,
      interval: 8000,
    });
    return txHash as `0x${string}`;
  }

  async verifyClaim(claimId: number): Promise<`0x${string}`> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "verify_claim",
      args: [claimId],
    });
    await this.client.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      retries: 60,
      interval: 8000,
    });
    return txHash as `0x${string}`;
  }
}

export default TruthBond;
