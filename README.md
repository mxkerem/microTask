# 🧩 Micro-Task Payment dApp

A minimal decentralized application for paying freelancers for completed micro-tasks using Stellar blockchain and Soroban smart contracts.

## 🚀 Features

- ✅ **Freighter Wallet Integration** - Connect using Freighter browser extension
- ✅ **Task Payment Interface** - Simple form to pay for completed tasks
- ✅ **Soroban Smart Contract** - Track payments and task completion
- ✅ **Modern UI** - Clean interface built with Next.js + Tailwind CSS
- ✅ **Testnet Ready** - Configured for Stellar Testnet

## Blockchain Info
- **Contract ID**: `CAIWBU72Y7JPHTNOWRQFOAI4S3SFIWAFYXIFHU2RFCSUA2XJOG7OYWZR`
- **Alias**: `micro_task_payment`
- **Explorer Link**: https://stellar.expert/explorer/testnet/contract/CAIWBU72Y7JPHTNOWRQFOAI4S3SFIWAFYXIFHU2RFCSUA2XJOG7OYWZR

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Blockchain**: Stellar Network, Soroban Smart Contracts
- **Wallet**: Freighter API integration
- **Smart Contract**: Rust + Soroban SDK

## 📋 Prerequisites

- Node.js 18.18.0+ or 20.0.0+
- Freighter Wallet Extension
- Stellar CLI (for contract deployment)

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Install Freighter Wallet
- Visit [freighter.app](https://freighter.app/)
- Install browser extension
- Create/import wallet
- **Switch to Testnet** in settings

### 4. Open Application
Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Smart Contract

The Soroban contract provides 3 simple functions:

```rust
// Record a completed task payment
complete_task_and_pay(task_id: u32, freelancer_address: Address, payment_amount: u32)

// Get total number of paid tasks
get_total_paid_tasks() -> u32

// Get last paid task information
get_last_paid_task_info() -> Option<(u32, Address)>
```

### Deploy Contract
```bash
cd contracts/micro_task_payment
stellar contract build
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/micro_task_payment.wasm --source alice --network testnet
```

## 📱 How to Use

1. **Connect Wallet**: Click "Connect Freighter Wallet" on home page
2. **Fill Task Details**: Enter task ID, freelancer address, and payment amount
3. **Pay for Task**: Click "Pay for Task" to record the payment
4. **View Stats**: See total tasks paid and last payment info

## 🏗 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Home page (wallet connection)
│   └── main/page.tsx   # Main dashboard
├── components/         # Reusable React components
├── hooks/             # Custom React hooks (Freighter integration)
└── types/             # TypeScript type definitions

contracts/
└── micro_task_payment/ # Soroban smart contract
    └── src/lib.rs     # Contract implementation
```

## 🌟 Development Notes

- Frontend currently logs payment details to console

## 🔗 Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet](https://freighter.app/)

---

Built with ❤️ for the Stellar ecosystem
