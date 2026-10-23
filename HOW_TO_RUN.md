# How to Run the Decentralized Chat App (Complete Guide)

Follow these steps to set up and run the application from scratch.

## Prerequisites
1. **Node.js**: Installed on your system.
2. **MetaMask**: Browser extension installed.

---

## 🚀 Option 1: One-Click Startup (Windows)
The easiest way to run the app.

1. Double-click **`start-dev.bat`** in the project folder.
2. This will:
   - Open a specific terminal for the **Hardhat Node** (Do not close this!).
   - Deploy the smart contracts automatically.
   - Start the **Frontend** development server.
3. Open your browser to the URL shown (usually `http://localhost:5173`).

---

## 🛠️ Option 2: Manual Startup
If you prefer running commands manually.

### 1. Install Dependencies
Run this once to install all project packages.
```bash
npm install --legacy-peer-deps
```

### 2. Start Local Blockchain
This acts as your local Ethereum network.
```bash
npx hardhat node or npm run node
```
> **IMPORTANT**: Keep this terminal window **OPEN** at all times.

### 3. Deploy Smart Contract
Open a **NEW** terminal (leave the previous one running) and run:
```bash
node deploy-and-setup.js
```
This script will:
- Compile the contracts.
- Deploy a fresh contract to your local node.
- Automatically update `src/config/contract.js` with the new address.

### 4. Start Frontend
In the same terminal (or a new one), run:
```bash
npm run dev
```

---

## 🦊 MetaMask Configuration
You must configure MetaMask to talk to your local blockchain.

1. **Add Network**:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Test Account**:
   - Copy one of the **Private Keys** from the "Hardhat Node" terminal output (e.g., Account #0).
   - In MetaMask: Click Account Icon > **Import Account** > Paste Private Key.

3. **Reset Account (Crucial!)**:
   - If you restart the Hardhat Node, MetaMask gets confused by the reset transaction history.
   - **Fix**: Go to **Settings > Advanced > Clear activity tab data**. Do this every time you restart `npx hardhat node`.

---

## ✅ Verification
1. Open the app in your browser.
2. Connect your MetaMask wallet (ensure you are on **Localhost 8545**).
3. Try **Registering** a username.
4. If successful, you are ready to chat!


🔑 Quick Recap (Command Order)
- npm install --legacy-peer-deps
- npx hardhat node (keep open)
- node scripts/deploy_standalone.js
- node scripts/deploy_standalone.js
- node scripts/identify_address.js
- npm run dev
- Configure MetaMask → Import account → Reset if needed
- Open browser → Test the app

