const { ethers } = require("ethers");

async function main() {
    const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const DEPLOYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    console.log(`Checking status for ${DEPLOYER_ADDRESS} on ${CONTRACT_ADDRESS}`);

    const ChatApp = await ethers.getContractFactory("ChatApp");
    const contract = ChatApp.attach(CONTRACT_ADDRESS);

    try {
        const exists = await contract.checkUserExists(DEPLOYER_ADDRESS);
        console.log(`Exists: ${exists}`);
        if (exists) {
            const name = await contract.getUsername(DEPLOYER_ADDRESS);
            console.log(`Username: ${name}`);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
