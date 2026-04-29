"use client";

import { useState } from "react";
import { useWallet } from "@/lib/genlayer/wallet";
import {
  useClaims,
  useStats,
  useSubmitClaim,
  useVerifyClaim,
} from "@/lib/hooks/useTruthBond";
import { Navbar } from "@/components/Navbar";
import type { Claim } from "@/lib/contracts/types";

function VerdictBadge({ verdict, status }: { verdict?: string; status: string }) {
  if (verdict === "FAKE")
    return <span className="px-2 py-0.5 text-xs font-bold tracking-widest border border-red-500/40 bg-red-500/10 text-red-400 rounded-sm">FAKE</span>;
  if (verdict === "REAL")
    return <span className="px-2 py-0.5 text-xs font-bold tracking-widest border border-green-500/40 bg-green-500/10 text-green-400 rounded-sm">REAL</span>;
  return <span className="px-2 py-0.5 text-xs font-bold tracking-widest border border-amber-500/40 bg-amber-500/10 text-amber-400 rounded-sm">PENDING</span>;
}

function ClaimCard({ claim }: { claim: Claim }) {
  const verify = useVerifyClaim();
  return (
    <div className="border border-border bg-card p-4 rounded-sm">
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
          &ldquo;{claim.reason}&rdquo;
        </p>
      )}
      {claim.status === "pending" && (
        <button onClick={() => verify.mutate(claim.id)} disabled={verify.isPending}
          className="mt-3 text-xs border border-border text-amber-400 hover:border-amber-400 px-3 py-1.5 transition-colors disabled:opacity-50 rounded-sm">
          {verify.isPending ? "Requesting..." : "⚡ Request AI Verdict"}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const { isConnected } = useWallet();
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
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <span className="text-xs tracking-[0.3em] text-green-400 uppercase block mb-4">⚖ GenLayer Intelligent Contract</span>
        <h1 className="font-display text-6xl sm:text-8xl leading-none mb-4">
          The AI<br /><em className="text-green-400 not-italic">Fake News</em><br />Court
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-10">
          Submit any article URL. AI validators fetch it live, reason over it with LLMs,
          and reach consensus via Optimistic Democracy. Truth wins on-chain.
        </p>
        <div className="flex justify-center gap-10">
          <div className="text-center">
            <div className="text-4xl font-bold font-display text-green-400">{isLoading ? "—" : stats.total}</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase mt-1">Claims Filed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold font-display text-red-400">{isLoading ? "—" : stats.fake}</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase mt-1">Marked Fake</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold font-display text-green-400">{isLoading ? "—" : stats.real}</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase mt-1">Verified Real</div>
          </div>
        </div>
      </section>
      <hr className="border-border" />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div className="border border-border p-4 flex flex-wrap gap-4 text-xs rounded-sm">
          <div>
            <span className="text-muted-foreground tracking-widest uppercase block mb-1">Contract</span>
            <a href="https://explorer-bradbury.genlayer.com/address/0x21F6D24E5b422780e6253A0F25620AC56246" target="_blank" className="text-green-400 hover:underline break-all">
              0x21F6D24E5b422780...AC56246
            </a>
          </div>
          <div>
            <span className="text-muted-foreground tracking-widest uppercase block mb-1">Network</span>
            <span className="text-green-400">GenLayer Testnet Bradbury</span>
          </div>
          <div>
            <span className="text-muted-foreground tracking-widest uppercase block mb-1">Source</span>
            <a href="https://github.com/arpdoul/truthbond-v2" target="_blank" className="text-green-400 hover:underline">github.com/arpdoul/truthbond-v2</a>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">File a Claim</p>
          <div className="border border-border bg-card p-5 relative overflow-hidden rounded-sm">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-transparent" />
            <h2 className="font-display text-2xl tracking-wide mb-1">SUBMIT ARTICLE FOR VERDICT</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Paste any news article URL. GenLayer AI validators fetch it live and return a FAKE or REAL verdict.
            </p>
            <div className="flex border border-border focus-within:border-green-400 transition-colors rounded-sm overflow-hidden">
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="https://example.com/news-article"
                className="flex-1 bg-transparent text-sm px-3 py-3 outline-none placeholder:text-muted-foreground" />
              <button onClick={handleSubmit} disabled={submit.isPending || !isConnected || !url}
                className="bg-green-400 text-black text-xs font-bold tracking-widest uppercase px-4 hover:bg-green-300 transition-colors disabled:bg-muted disabled:cursor-not-allowed whitespace-nowrap">
                {submit.isPending ? "SUBMITTING..." : "SUBMIT →"}
              </button>
            </div>
            {!isConnected && <p className="text-xs text-amber-400 mt-2">⚠ Connect your wallet above to submit claims on-chain.</p>}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">How It Works</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: "01", t: "YOU SUBMIT", d: "Paste a URL and sign a transaction to the TruthBond contract." },
              { n: "02", t: "AI FETCHES", d: "Validators fetch the live article directly — no oracles." },
              { n: "03", t: "LLMs REASON", d: "Multiple validators independently judge FAKE or REAL." },
              { n: "04", t: "CONSENSUS", d: "Optimistic Democracy writes the result immutably on-chain." },
            ].map((s) => (
              <div key={s.n} className="border border-border bg-card p-4 rounded-sm">
                <div className="font-display text-4xl text-border mb-2">{s.n}</div>
                <h3 className="text-xs font-bold tracking-widest mb-1">{s.t}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Live Claims Feed</p>
            <button onClick={() => refetch()}
              className="text-xs border border-border text-muted-foreground hover:border-green-400 hover:text-green-400 px-3 py-1.5 transition-colors rounded-sm">
              ↻ REFRESH
            </button>
          </div>
          {isLoading ? (
            <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground rounded-sm">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full mb-3" />
              <div>Loading claims from chain...</div>
            </div>
          ) : claims.length === 0 ? (
            <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground rounded-sm">
              No claims yet — be the first to submit above!
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
        <a href="https://github.com/arpdoul/truthbond-v2" target="_blank" className="hover:text-green-400">Open Source</a>
        &nbsp;•&nbsp; Testnet Bradbury (Phase 1)
      </footer>
    </div>
  );
}
