"use client";

import { useWallet } from "@/lib/genlayer/wallet";
import { useState } from "react";
import { connectMetaMask, switchToGenLayerNetwork, isOnGenLayerNetwork } from "@/lib/genlayer/client";

export function Navbar() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [open, setOpen] = useState(false);

  const short = (a: string) => a.slice(0, 6) + "..." + a.slice(-4);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="font-display text-2xl tracking-widest">
          TRUTH<span className="text-green-400">BOND</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            BRADBURY TESTNET
          </div>
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="text-xs border border-green-400 bg-green-400 text-black font-bold tracking-widest px-3 py-1.5 hover:bg-green-300 transition-colors rounded-sm"
              >
                {short(address)} ▾
              </button>
              {open && (
                <div className="absolute right-0 top-full mt-1 border border-border bg-card text-xs w-40 z-50 rounded-sm shadow-lg">
                  <button
                    onClick={() => { disconnectWallet(); setOpen(false); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-border/30 text-muted-foreground"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="text-xs border border-green-400 text-green-400 font-bold tracking-widest px-3 py-1.5 hover:bg-green-400 hover:text-black transition-colors rounded-sm"
            >
              CONNECT WALLET
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
