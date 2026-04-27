# TruthBond ⚖️

> AI-powered fake news bounty market built on GenLayer Testnet Bradbury

## What is TruthBond?

TruthBond is a decentralized fake news detection court. Anyone can submit a news article URL as a claim. GenLayer's AI validators fetch the article live from the web, analyze it using LLM reasoning, and reach consensus via **Optimistic Democracy** — writing a FAKE or REAL verdict immutably on-chain.

No oracles. No middlemen. Truth enforced by AI consensus.

## How It Works

1. **Submit** — User pastes a news article URL and signs a transaction
2. **Fetch** — GenLayer validators fetch the live article content directly
3. **Reason** — Multiple validators independently judge FAKE or REAL using LLMs
4. **Consensus** — Optimistic Democracy reconciles verdicts on-chain forever

## Deployment

- **Contract:** 0x21F6D24E5b422780e6253A0F25620AC56246
- **Network:** GenLayer Testnet Bradbury (Phase 1)
- **Explorer:** https://explorer-bradbury.genlayer.com/address/0x21F6D24E5b422780e6253A0F25620AC56246
- **TX Hash:** 0x5f8f1717eb9a748a86f5e6daf3dbf6d068b2a6519e1d384aad0279afb9b87349
- **Live App:** https://truthbond-v2.vercel.app

## Tech Stack

- Intelligent Contract: Python on GenLayer (GenVM)
- Frontend: Next.js 15, TypeScript, TanStack Query, Tailwind CSS
- Wallet: genlayer-js SDK + wagmi + MetaMask
- Network: GenLayer Testnet Bradbury
- Hosting: Vercel

## Project Structure

    truthbond-v2/
    contracts/
        TruthBond.py        GenLayer Intelligent Contract
    frontend/
        app/
            page.tsx        Main dApp page
            layout.tsx      Root layout
            providers.tsx   Wallet + Query providers
        components/
            Navbar.tsx      Header with wallet connect
        lib/
            contracts/
                TruthBond.ts    Contract client functions
                types.ts        TypeScript types
            hooks/
                useTruthBond.ts React hooks

## Environment Variables

    NEXT_PUBLIC_GENLAYER_RPC_URL=https://rpc-bradbury.genlayer.com
    NEXT_PUBLIC_GENLAYER_CHAIN_ID=13473
    NEXT_PUBLIC_GENLAYER_CHAIN_NAME=GenLayer Testnet Bradbury
    NEXT_PUBLIC_GENLAYER_SYMBOL=GEN
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x21F6D24E5b422780e6253A0F25620AC56246

## GenLayer Features Used

- Live web access: gl.get_webpage() fetches articles directly
- LLM reasoning: gl.eq_principle_prompt_comparative() judges content
- Optimistic Democracy: decentralized AI consensus on verdicts
- Python Intelligent Contracts: full Python contract logic on-chain

## Running Locally

    git clone https://github.com/arpdoul/truthbond-v2.git
    cd truthbond-v2/frontend
    cp .env.example .env
    npm install
    npm run dev

## License

MIT — Built by @arpdoul on GenLayer Testnet Bradbury
