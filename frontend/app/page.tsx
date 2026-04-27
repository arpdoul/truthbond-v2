"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useClaims, useStats, useSubmitClaim, useVerifyClaim } from "@/lib/hooks/useTruthBond";
import { Navbar } from "@/components/Navbar";
import type { Claim } from "@/lib/contracts/types";

function StatCard({ value, label, color }: { value: number | string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-4xl font-bold font-display ${color || "text-green-400"}`}>{value}</div>
      <div className="text-xs text-muted-foreground tracking-widest uppercase mt-1">{label}</div>
    </div>
  );
}

function VerdictBadge({ verdict, status }: { verdict?: string; status: string }) {
  if (verdict === "FAKE") return <span className="px-2 py-0.5 text-xs font-bold tracking-widest border border-red-500/40 bg-red-500/10 text-red-400 rounded-sm">FAKE</span>;
  if (verdict === "REAL") return <span className="px-2 py-0.5 text-xs font-bold tracking-widest border border-green-500/40 bg-green-500/10 text-green-400 rounded-sm">REAL</span>;
  return <span className="px-2 py-0.5 text-xs font-bold tracking-widest border border-amber-500/40 bg-amber-500/10 text-amber-400 rounded-sm">PENDING</span>;
}

function ClaimCard({ claim }: { claim: Claim }) {
  const verify = useVerifyClaim();
  return (
    <div className="border border-border bg-card p-4 rounded-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-start gap-3 mb-3">
        <span className="text-xs text-muted-foreground tracking-widest">CLAIM #{claim.id}</span>
        <VerdictBadge verdict={claim.verdict} status={claim.status} />
      </div>
      <a href={claim.url} target="_blank" rel="noopener noreferrer"
        className="text-sm text-foreground/80 hover:text-green-400 border-b border-border hover:border-green-400 transition-colors break-all leading-relaxed block mb-2">
        {claim.url}
      </a>
      {claim.reason && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2 leading-relaxed">
          "{claim.reason}"
        </p>
      )}
      {claim.status === "pending" && (
        <button
          onClick={() => verify.mutate(claim.id)}
          disabled={verify.isPending}
          className="mt-3 text-xs border border-border text-amber-400 hover:border-amber-400 px-3 py-1.5 transition-colors disabled:opacity-50">
          {verify.isPending ? "Requesting..." : "⚡ Request AI Verdict"}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const { isConnected } = useAccount();
  const { data: claims = [], isLoading, refetch } = useClaims();
  const stats = useStats();
  const submit = useSubmitClaim();

  async function handleSubmit() {
    if (!url.trim()) return;
    await submit.mutateAsync(url.trim());
    setUrl("");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <span className="text-xs tracking-[0.3em] text-green-400 uppercase block mb-4">
          ⚖ GenLayer Intelligent Contract
        </span>
        <h1 className="font-display text-6xl sm:text-8xl leading-none mb-4">
          The AI<br />
          <span className="italic text-green-400">Fake News</span><br />
          Court
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-10">
          Submit any article URL. AI validators fetch it live, reason over it with LLMs,
          and reach consensus via Optimistic Democracy. Truth wins on-chain.
        </p>
        <div className="flex justify-center gap-10">
          <StatCard value={isLoading ? "—" : stats.total} label="Claims Filed" />
          <StatCard value={isLoading ? "—" : stats.fake} label="Marked Fake" color="text-red-400" />
          <StatCard value={isLoading ? "—" : stats.real} label="Verified Real" />
        </div>
      </section>

      <hr className="border-border" />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Contract info */}
        <div className="border border-border p-4 flex flex-wrap gap-4 text-xs">
          <div><span className="text-muted-foreground tracking-widest uppercase block mb-1">Contract</span>
            <a href={`https://explorer-bradbury.genlayer.com/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              target="_blank" className="text-green-400 hover:underline break-all">
              {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 20)}...
            </a>
          </div>
          <div><span className="text-muted-foreground tracking-widest uppercase block mb-1">Network</span>
            <span className="text-green-400">GenLayer Testnet Bradbury</span>
          </div>
          <div><span className="text-muted-foreground tracking-widest uppercase block mb-1">Source</span>
            <a href="https://github.com/arpdoul/truthbond" target="_blank" className="text-green-400 hover:underline">
              github.com/arpdoul/truthbond
            </a>
          </div>
        </div>

        {/* Submit */}
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-border">
            File a Claim
          </div>
          <div className="border border-border bg-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-transparent" />
            <h2 className="font-display text-2xl tracking-wide mb-1">SUBMIT ARTICLE FOR VERDICT</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Paste any news article URL. GenLayer AI validators fetch it live and return a FAKE or REAL verdict.
            </p>
            <div className="flex border border-border focus-within:border-green-400 transition-colors">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="https://example.com/news-article"
                className="flex-1 bg-transparent text-sm px-3 py-3 outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSubmit}
                disabled={submit.isPending || !isConnected || !url}
                className="bg-green-400 text-black text-xs font-bold tracking-widest uppercase px-4 hover:bg-green-300 transition-colors disabled:bg-muted disabled:cursor-not-allowed whitespace-nowrap">
                {submit.isPending ? "SUBMITTING..." : "SUBMIT →"}
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-amber-400 mt-2">⚠ Connect your wallet above to submit claims on-chain.</p>
            )}
          </div>
        </div>

        {/* How it works */}
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-border">
            How It Works
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { n: "01", t: "YOU SUBMIT", d: "Paste a URL and sign a transaction to the TruthBond contract." },
              { n: "02", t: "AI FETCHES", d: "Validators fetch the live article directly — no oracles." },
              { n: "03", t: "LLMs REASON", d: "Multiple validators independently judge FAKE or REAL." },
              { n: "04", t: "CONSENSUS", d: "Optimistic Democracy writes the result immutably on-chain." },
            ].map((s) => (
              <div key={s.n} className="border border-border bg-card p-4">
                <div className="font-display text-4xl text-border mb-2">{s.n}</div>
                <h3 className="text-xs font-bold tracking-widest mb-1">{s.t}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Claims feed */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3 flex-1 after:flex-1 after:h-px after:bg-border">
              Live Claims Feed
            </div>
            <button onClick={() => refetch()}
              className="ml-4 text-xs border border-border text-muted-foreground hover:border-green-400 hover:text-green-400 px-3 py-1.5 transition-colors">
              ↻ REFRESH
            </button>
          </div>
          {isLoading ? (
            <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full mb-3" />
              <div>Loading claims from chain...</div>
            </div>
          ) : claims.length === 0 ? (
            <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground">
              📋 No claims yet — be the first to submit above!
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built on <a href="https://genlayer.com" target="_blank" className="hover:text-green-400">GenLayer</a>
        &nbsp;•&nbsp;
        <a href="https://github.com/arpdoul/truthbond" target="_blank" className="hover:text-green-400">Open Source</a>
        &nbsp;•&nbsp; Testnet Bradbury (Phase 1)
      </footer>
    </div>
  );
}
