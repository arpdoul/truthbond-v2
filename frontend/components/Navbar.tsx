"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);

  function shortAddr(addr: string) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="font-display text-2xl tracking-widest">
          TRUTH<span className="text-green-400">BOND</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            BRADBURY TESTNET
          </div>
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-xs border border-green-400 bg-green-400 text-black font-bold tracking-widest px-3 py-1.5 hover:bg-green-300 transition-colors">
                {shortAddr(address)} ▾
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 border border-border bg-card text-xs w-40 z-50">
                  <button
                    onClick={() => { disconnect(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-border/30 text-muted-foreground">
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="text-xs border border-green-400 text-green-400 font-bold tracking-widest px-3 py-1.5 hover:bg-green-400 hover:text-black transition-colors">
              CONNECT WALLET
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
