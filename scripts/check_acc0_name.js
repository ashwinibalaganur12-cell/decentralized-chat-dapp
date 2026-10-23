const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const address = await signer.getAddress();
    console.log("Checking Account 0:", address);

    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    const name = await contract.getUsername(address);
    console.log("Blockchain Name for Account 0:", name);
}

main().catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
});
