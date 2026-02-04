# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Activity Proof - A multi-chain activity verification platform that rewards users with free NFTs for on-chain activity. Supports multiple blockchain networks with easy addition of new chains. Built with Next.js frontend and Solidity smart contracts in a monorepo structure.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Smart Contracts**: Solidity 0.8.24, Hardhat 2.x
- **Storage**: Pinata/IPFS for NFT metadata and assets
- **Networks**: Multi-chain support (Pharos Testnet, Ethereum Sepolia, Base, Arbitrum, etc.)

## Commands

```bash
# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint

# Smart Contracts
npm run compile      # Compile Solidity contracts
npm run test:contracts  # Run Hardhat tests
npm run deploy       # Deploy to configured network
```

## Project Structure

```
/src              # Next.js App Router frontend
  /lib
    chains.ts     # Multi-chain configuration registry
    contracts.ts  # Per-chain contract addresses & ABI
    wagmi.ts      # Wagmi multi-chain config
    activityCheck.ts  # Chain-specific activity verification
  /components     # React components
  /hooks          # Custom React hooks
  /types          # TypeScript types
/contracts        # Solidity smart contracts
/test             # Hardhat contract tests
/scripts          # Deployment scripts
/artifacts        # Compiled contract ABIs (generated)
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `PRIVATE_KEY` - Wallet private key for deployments
- `NEXT_PUBLIC_*_RPC_URL` - RPC endpoints per chain
- `NEXT_PUBLIC_*_API_KEY` - Block explorer API keys per chain
- `PINATA_API_KEY` / `PINATA_SECRET_KEY` - IPFS pinning
- `NEXT_PUBLIC_*_ADDRESS` - Contract addresses per chain/month

## Key Architecture Decisions

1. **Monorepo**: Frontend and contracts live together for easier type sharing and deployment coordination
2. **App Router**: Using Next.js App Router with `/src` directory
3. **Multi-Chain**: Chain configuration in `/src/lib/chains.ts` allows easy addition of new networks
4. **Contract ABIs**: Import from `/artifacts` after compilation for type-safe contract interactions
