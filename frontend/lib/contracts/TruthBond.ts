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

  async submitClaim(articleUrl: string): Promise<any> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "submit_claim",
        args: [articleUrl],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });
      return receipt;
    } catch (error) {
      console.error("Error submitting claim:", error);
      throw new Error("Failed to submit claim");
    }
  }

  async verifyClaim(claimId: number): Promise<any> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "verify_claim",
        args: [claimId],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });
      return receipt;
    } catch (error) {
      console.error("Error verifying claim:", error);
      throw new Error("Failed to verify claim");
    }
  }
}

export default TruthBond;
