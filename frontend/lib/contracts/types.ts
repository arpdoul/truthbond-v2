export interface Claim {
  id: number;
  url: string;
  status: "pending" | "verified";
  verdict?: "FAKE" | "REAL";
  reason?: string;
}
