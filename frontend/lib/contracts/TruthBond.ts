import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
  "https://rpc-bradbury.genlayer.com";

export function getTruthBondClient(account?: `0x${string}`) {
  return createClient({
    chain: testnetBradbury,
    account: account
      ? { address: account }
      : undefined,
  });
}

export async function getTotalClaims(): Promise<number> {
  const client = getTruthBondClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_total_claims",
    args: [],
  });
  return Number(result) || 0;
}

export async function getClaim(id: number): Promise<Claim | null> {
  try {
    const client = getTruthBondClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_claim",
      args: [id],
    });
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    return { id, ...parsed } as Claim;
  } catch {
    return null;
  }
}
