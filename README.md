# Decentralized Chat Application 🔗💬

A blockchain-based messaging application designed to enable users to communicate through a decentralized platform using Ethereum-compatible blockchain technology.

## 📌 Project Overview

The Decentralized Chat Application is a Web3 project that explores blockchain-based messaging, wallet connectivity, and message encryption. It integrates a React frontend with smart contracts to demonstrate how decentralized technologies can support peer-to-peer communication.

## ✨ Features

- **Wallet Connection:** Connect using MetaMask.
- **Decentralized Messaging:** Interact with blockchain smart contracts to manage messages.
- **Message Encryption:** Uses AES encryption to protect message content before storage.
- **Smart Contracts:** Built with Solidity.
- **Blockchain Integration:** Uses Ethers.js to communicate with the blockchain.
- **Responsive Interface:** A web interface built with React.
- **Event-Based Updates:** Supports listening to blockchain events for message updates.

*Note: Describe encryption and privacy guarantees accurately based on your implementation. Blockchain data may be publicly visible.*

## 🛠️ Technologies Used

- **Frontend:** React.js, JavaScript, HTML, CSS
- **Blockchain:** Ethereum-compatible networks
- **Smart Contracts:** Solidity
- **Blockchain Development:** Hardhat
- **Wallet:** MetaMask
- **Web3 Library:** Ethers.js
- **Encryption:** CryptoJS (AES)
- **Version Control:** Git and GitHub

## ⚙️ Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- MetaMask browser extension
- A compatible Ethereum development network

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ashwinibalaganur12-cell/decentralized-chat-dapp.git
cd decentralized-chat-dapp
```

### 2. Install dependencies

```bash
npm install
```

If the project uses separate frontend and smart-contract folders with their own `package.json` files, install dependencies in each relevant folder instead.

### 3. Configure environment variables

Review `.env.example` and create a local `.env` file if required by the project.

Never commit real private keys, passwords, API secrets, or wallet credentials.

### 4. Start the local blockchain

If the project uses Hardhat, run the command from the directory containing its Hardhat configuration:

```bash
npx hardhat node
```

Keep this terminal running.

### 5. Compile and deploy the smart contract

Use the project's configured Hardhat compile and deployment scripts. For example:

```bash
npx hardhat compile
```

Deploy using the correct script and network configuration documented in the repository.

### 6. Start the frontend

From the frontend directory, run the script configured in its `package.json`. For a Vite application, this is commonly:

```bash
npm run dev
```

Open the local URL shown in the terminal and connect MetaMask to the appropriate network.

## 📸 Screenshots

Add screenshots of your actual running application here.

Suggested screenshots:
- Application home page
- MetaMask wallet connection
- Chat interface
- Message sending and receiving

## 🔮 Future Enhancements

- End-to-end encryption improvements
- Layer-2 network integration
- Multi-device support
- Improved user interface and accessibility
- Message expiry and self-destruct options
- More comprehensive automated testing

## 🔐 Security Notes

- Never publish wallet private keys or sensitive credentials.
- Keep secrets in local environment files excluded by `.gitignore`.
- Use test wallets and test networks during development.
- Remember that blockchain transactions and stored data may be publicly accessible.

## 👩‍💻 Author

**Ashwini S. Balaganur**

MCA Graduate | Aspiring Software Developer

GitHub: [ashwinibalaganur12-cell](https://github.com/ashwinibalaganur12-cell)

## 📄 License

Add a license if you choose to distribute this project under one. No license is specified here.
