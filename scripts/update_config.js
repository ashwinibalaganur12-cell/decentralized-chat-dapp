import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const addressPath = path.join(__dirname, "../contract_address.txt");
const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
const configPath = path.join(__dirname, "../src/config/contract.js");

if (!fs.existsSync(addressPath) || !fs.existsSync(artifactPath)) {
    console.error("❌ Missing address or artifact file.");
    process.exit(1);
}

const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abi = artifact.abi;

const newConfigContent = `// Contract Configuration
// Update the CONTRACT_ADDRESS after deploying your contract

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "${contractAddress}";

// ChatApp Contract ABI
export const CONTRACT_ABI = ${JSON.stringify(abi, null, 4)};

// Network Configuration
export const NETWORKS = {
    localhost: {
        chainId: 1337,
        name: 'Localhost',
        rpcUrl: 'http://127.0.0.1:8545'
    },
    ganache: {
        chainId: 1337,
        name: 'Ganache',
        rpcUrl: 'http://127.0.0.1:1337'
    },
    polygon: {
        chainId: 137,
        name: 'Polygon',
        rpcUrl: \`https://polygon-mainnet.infura.io/v3/\${import.meta.env.VITE_INFURA_KEY}\`
    },
    mainnet: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
    }
};

// Get the current network configuration
export const getCurrentNetwork = (chainId) => {
    return Object.values(NETWORKS).find(network => network.chainId === chainId) || NETWORKS.localhost;
};
`;

fs.writeFileSync(configPath, newConfigContent, "utf8");
console.log(`✅ Updated src/config/contract.js with address ${contractAddress}`);
