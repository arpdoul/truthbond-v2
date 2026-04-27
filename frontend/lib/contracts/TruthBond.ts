"use client";

import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
  "0x21F6D24E5b422780e6253A0F25620AC56246"
) as `0x${string}`;

function getBradburyClient() {
  return createClient({ chain: testnetBradbury });
}

export async function getTotalClaims(): Promise<number> {
  try {
    const client = getBradburyClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_total_claims",
      args: [],
    });
    return Number(result) || 0;
  } catch {
    return 0;
  }
}

export async function getClaimById(id: number) {
  try {
    const client = getBradburyClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_claim",
      args: [id],
    });
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    return { id, ...parsed };
  } catch {
    return null;
  }
}
