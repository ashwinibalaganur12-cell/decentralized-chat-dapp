const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting deployment with RANDOM deployer...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get the admin account (Account #0) to fund our random deployer
    const admin = await provider.getSigner(0);

    // 2. Create a random wallet for deployment
    // This ensures the deployer address is unique and not on any blacklist
    const randomWallet = ethers.Wallet.createRandom().connect(provider);
    console.log(`👤 Created random deployer: ${randomWallet.address}`);

    // 3. Fund the random wallet
    console.log("💸 Funding random deployer...");
    const tx = await admin.sendTransaction({
        to: randomWallet.address,
        value: ethers.parseEther("1.0")
    });
    await tx.wait();
    console.log("✅ Checkpoint: Wallet funded");

    // 4. Deploy contract using the random wallet
    console.log("⏳ Deploying ChatApp contract...");

    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, randomWallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log(`\n🎉 ChatApp deployed to ${contractAddress}`);
    console.log("(This address is unique and clean!)");

    // 5. Save address
    fs.writeFileSync(
        path.join(__dirname, "../contract_address.txt"),
        contractAddress,
        "utf8"
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
