#!/usr/bin/env node

/**
 * Quick Deployment Helper Script
 * This script helps you deploy the ChatApp contract and update the frontend configuration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 ChatApp Deployment Helper\n');

// Check if Hardhat is available
try {
    execSync('npx hardhat --version', { stdio: 'ignore' });
} catch (error) {
    console.error('❌ Hardhat not found. Please install Hardhat first.');
    process.exit(1);
}

// Step 1: Compile contracts
console.log('📝 Step 1: Compiling contracts...');
try {
    execSync('npx hardhat compile', { stdio: 'inherit' });
    console.log('✅ Contracts compiled successfully\n');
} catch (error) {
    console.error('❌ Failed to compile contracts');
    process.exit(1);
}

// Step 2: Deploy contract
console.log('📝 Step 2: Deploying contract to localhost...');
console.log('⚠️  Make sure Hardhat node is running in another terminal!\n');

try {
    const output = execSync('node scripts/deploy_standalone.js', {
        encoding: 'utf-8'
    });

    console.log(output);

    // Extract contract address from output
    const match = output.match(/ChatApp deployed to (0x[a-fA-F0-9]{40})/);

    if (match && match[1]) {
        const contractAddress = match[1];
        console.log(`\n✅ Contract deployed at: ${contractAddress}\n`);

        // Step 3: Update contract configuration
        console.log('📝 Step 3: Updating contract configuration...');

        const configPath = path.join(__dirname, 'src', 'config', 'contract.js');
        let configContent = fs.readFileSync(configPath, 'utf-8');

        // Replace the placeholder with actual address
        // Replace the address (whether placeholder or existing) with the new one
        configContent = configContent.replace(
            /export const CONTRACT_ADDRESS = .*;/g,
            `export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "${contractAddress}";`
        );

        fs.writeFileSync(configPath, configContent);
        console.log('✅ Contract configuration updated\n');

        console.log('🎉 Deployment complete!');
        console.log('\n📋 Next steps:');
        console.log('1. Make sure MetaMask is connected to localhost:8545');
        console.log('2. Import a test account from Hardhat node');
        console.log('3. Run: npm run dev');
        console.log('4. Open http://localhost:5173 and connect your wallet\n');

    } else {
        console.log('⚠️  Could not extract contract address from output');
        console.log('Please manually update src/config/contract.js with the deployed address');
    }

} catch (error) {
    console.error('\n❌ Deployment failed!');
    console.error('Make sure Hardhat node is running: npx hardhat node');
    process.exit(1);
}
