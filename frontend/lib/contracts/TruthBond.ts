"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Claim } from "./types";

const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://rpc-bradbury.genlayer.com";

function getReadClient() {
  return createClient({ chain: studionet, endpoint: RPC } as any);
}

function getWriteClient(address: string) {
  return createClient({
    chain: studionet,
    endpoint: RPC,
    account: address as `0x${string}`,
  } as any);
}

export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x21F6D24E5b422780e6253A0F25620AC56246313A"
) as `0x${string}`;

class TruthBond {
  private contractAddress: `0x${string}`;
  private address: string | null;

  constructor(contractAddress: string, address?: string | null) {
    this.contractAddress = contractAddress as `0x${string}`;
    this.address = address || null;
  }

  async getTotalClaims(): Promise<number> {
    try {
      const result: any = await getReadClient().readContract({
        address: this.contractAddress,
        functionName: "get_total_claims",
        args: [],
      });
      return Number(result) || 0;
    } catch { return 0; }
  }

  async getClaim(id: number): Promise<Claim | null> {
    try {
      const result: any = await getReadClient().readContract({
        address: this.contractAddress,
        functionName: "get_claim",
        args: [id],
      });
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      return { id, ...parsed } as Claim;
    } catch { return null; }
  }

  async submitClaim(articleUrl: string): Promise<any> {
    if (!this.address) throw new Error("Wallet not connected");
    const client = getWriteClient(this.address);
    const txHash = await client.writeContract({
      address: this.contractAddress,
      functionName: "submit_claim",
      args: [articleUrl],
      value: BigInt(0),
    });
    return await client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 24,
      interval: 5000,
    });
  }

  async verifyClaim(claimId: number): Promise<any> {
    if (!this.address) throw new Error("Wallet not connected");
    const client = getWriteClient(this.address);
    const txHash = await client.writeContract({
      address: this.contractAddress,
      functionName: "verify_claim",
      args: [claimId],
      value: BigInt(0),
    });
    return await client.waitForTransactionReceipt({
      hash: txHash,
      status: "ACCEPTED" as any,
      retries: 24,
      interval: 5000,
    });
  }
}

export default TruthBond;
