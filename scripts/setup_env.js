import { execSync } from 'child_process';
import chalk from 'chalk'; // Optional: for colored output if installed, otherwise simple console.log

const runCommand = (command, description) => {
    try {
        console.log(`\n🚀 ${description}...`);
        console.log(`> ${command}`);
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} successful.`);
    } catch (error) {
        console.error(`❌ ${description} failed.`);
        process.exit(1);
    }
};

const main = () => {
    console.log("🛠️  Starting Development Environment Setup...");

    // 1. Compile Smart Contracts
    runCommand("npx hardhat compile", "Compiling Smart Contracts");

    // 2. Deploy Contract (Standalone)
    runCommand("node scripts/deploy_standalone.js", "Deploying Contract");

    // 3. Update Frontend Config
    runCommand("node scripts/update_config.js", "Updating Frontend Configuration");

    // 4. Register Default User
    runCommand("node scripts/register_user.js", "Registering Default User (Ashwin)");

    console.log("\n✨ Setup Complete! You can now run 'npm run dev' to start the frontend.");
};

main();
