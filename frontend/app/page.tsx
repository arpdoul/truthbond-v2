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
  const [tab, setTab] = useState<"wallet" | "cli">("wallet");
  const { isConnected, address } = useWallet();
  const { data: claims = [], isLoading, refetch } = useClaims();
  const stats = useStats();
  const submit = useSubmitClaim();

  const cliCommand = url
    ? `node ~/truthbond/write_claim.mjs "${url}"`
    : `node ~/truthbond/write_claim.mjs "https://your-article-url.com"`;

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
          <em className="text-green-400 not-italic">Fake News</em><br />
          Court
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

        {/* Contract info bar */}
        <div className="border border-border p-4 flex flex-wrap gap-4 text-xs rounded-sm">
          <div>
            <span className="text-muted-foreground tracking-widest uppercase block mb-1">Contract</span>
            <a href="https://explorer-bradbury.genlayer.com/address/0x21F6D24E5b422780e6253A0F25620AC56246313A"
              target="_blank" className="text-green-400 hover:underline break-all">
              0x21F6D24E5b422780...6313A
            </a>
          </div>
          <div>
            <span className="text-muted-foreground tracking-widest uppercase block mb-1">Network</span>
            <span className="text-green-400">GenLayer Testnet Bradbury</span>
          </div>
          <div>
            <span className="text-muted-foreground tracking-widest uppercase block mb-1">Source</span>
            <a href="https://github.com/arpdoul/truthbond-v2" target="_blank" className="text-green-400 hover:underline">
              github.com/arpdoul/truthbond-v2
            </a>
          </div>
        </div>

        {/* Submit section */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">File a Claim</p>
          <div className="border border-border bg-card relative overflow-hidden rounded-sm">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-transparent" />

            {/* URL input — shared between both tabs */}
            <div className="p-5 pb-0">
              <h2 className="font-display text-2xl tracking-wide mb-1">SUBMIT ARTICLE FOR VERDICT</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Paste any news article URL to submit it for AI fact-checking on GenLayer.
              </p>
              <div className="border border-border focus-within:border-green-400 transition-colors rounded-sm overflow-hidden mb-4">
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && tab === "wallet" && handleSubmit()}
                  placeholder="https://example.com/news-article-to-verify"
                  className="w-full bg-transparent text-sm px-3 py-3 outline-none placeholder:text-muted-foreground" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-t border-border">
              <button onClick={() => setTab("wallet")}
                className={`flex-1 text-xs font-bold tracking-widest uppercase py-2.5 transition-colors ${tab === "wallet" ? "bg-green-400/10 text-green-400 border-b-2 border-green-400" : "text-muted-foreground hover:text-foreground"}`}>
                🦊 Wallet
              </button>
              <button onClick={() => setTab("cli")}
                className={`flex-1 text-xs font-bold tracking-widest uppercase py-2.5 transition-colors ${tab === "cli" ? "bg-green-400/10 text-green-400 border-b-2 border-green-400" : "text-muted-foreground hover:text-foreground"}`}>
                ⌨ CLI
              </button>
            </div>

            {/* Wallet tab */}
            {tab === "wallet" && (
              <div className="p-5 pt-4">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Connect a wallet configured for GenLayer Bradbury (Chain ID: 4221) to submit directly on-chain.
                </p>
                <button onClick={handleSubmit}
                  disabled={submit.isPending || !isConnected || !url}
                  className="w-full bg-green-400 text-black text-xs font-bold tracking-widest uppercase py-3 hover:bg-green-300 transition-colors disabled:bg-muted disabled:cursor-not-allowed rounded-sm">
                  {submit.isPending ? "⏳ SUBMITTING..." : "SUBMIT VIA WALLET →"}
                </button>
                {!isConnected && (
                  <p className="text-xs text-amber-400 mt-2">
                    ⚠ Connect your wallet above. Make sure it is set to GenLayer Bradbury (Chain ID: 4221).
                  </p>
                )}
                {submit.isSuccess && (
                  <p className="text-xs text-green-400 mt-2">
                    ✅ Claim submitted! AI validators are analyzing. Refresh feed in 3-5 mins.
                  </p>
                )}
                {submit.isError && (
                  <p className="text-xs text-red-400 mt-2">
                    ⚠ {submit.error?.message}
                  </p>
                )}
              </div>
            )}

            {/* CLI tab */}
            {tab === "cli" && (
              <div className="p-5 pt-4">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Submit directly from Termux using the genlayer-js SDK. This bypasses browser wallet limitations and signs with your private key.
                </p>
                <div className="bg-black border border-border rounded-sm p-3 mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Run in Termux:</p>
                  <code className="text-xs text-green-400 break-all leading-relaxed block">
                    {cliCommand}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Don&apos;t have the CLI set up?{" "}
                  <a href="https://github.com/arpdoul/truthbond-v2#running-locally"
                    target="_blank" className="text-green-400 hover:underline">
                    See setup guide →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">How It Works</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: "01", t: "SUBMIT", d: "Paste a URL and sign a transaction to TruthBond." },
              { n: "02", t: "AI FETCHES", d: "Validators fetch the live article — no oracles." },
              { n: "03", t: "LLMs REASON", d: "Each validator judges independently: FAKE or REAL." },
              { n: "04", t: "CONSENSUS", d: "Optimistic Democracy writes the verdict on-chain." },
            ].map((s) => (
              <div key={s.n} className="border border-border bg-card p-4 rounded-sm">
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
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Live Claims Feed</p>
            <button onClick={() => refetch()}
              className="text-xs border border-border text-muted-foreground hover:border-green-400 hover:text-green-400 px-3 py-1.5 transition-colors rounded-sm">
              ↻ REFRESH
            </button>
          </div>
          {isLoading ? (
            <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground rounded-sm">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full mb-3" />
              <div>Loading claims from GenLayer Bradbury...</div>
            </div>
          ) : claims.length === 0 ? (
            <div className="border border-dashed border-border p-10 text-center text-xs text-muted-foreground rounded-sm">
              No claims yet — submit the first one above!
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built on{" "}
        <a href="https://genlayer.com" target="_blank" className="hover:text-green-400">GenLayer</a>
        &nbsp;•&nbsp;
        <a href="https://github.com/arpdoul/truthbond-v2" target="_blank" className="hover:text-green-400">Open Source</a>
        &nbsp;•&nbsp; Testnet Bradbury (Phase 1)
      </footer>
    </div>
  );
}
