const hre = require("hardhat");

async function main() {
    const signers = await hre.ethers.getSigners();
    const acc1 = signers[0]; // hardhat1 (Ashwin)
    // Account 18
    const mnemonic = "test test test test test test test test test test test junk";
    const wallet = hre.ethers.HDNodeWallet.fromPhrase(mnemonic, null, "m/44'/60'/0'/0");
    const acc18_wallet = wallet.deriveChild(18);
    // We need a signer connected to the provider for acc18
    const acc18 = new hre.ethers.Wallet(acc18_wallet.privateKey, hre.ethers.provider);

    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const contractAs1 = ChatApp.attach(contractAddress).connect(acc1);
    const contractAs18 = ChatApp.attach(contractAddress).connect(acc18);

    console.log(`Account 1: ${acc1.address}`);
    console.log(`Account 18: ${acc18.address}`);

    // Check friendship
    const friends1 = await contractAs1.getMyFriendList();
    const isFriend1 = friends1.some(f => f.pubkey.toLowerCase() === acc18.address.toLowerCase());
    console.log(`Is Account 18 in Account 1's friend list? ${isFriend1}`);

    const friends18 = await contractAs18.getMyFriendList();
    const isFriend18 = friends18.some(f => f.pubkey.toLowerCase() === acc1.address.toLowerCase());
    console.log(`Is Account 1 in Account 18's friend list? ${isFriend18}`);

    // Check messages
    // Messages are retrieved by passing the *friend's* key to readMessage
    const msgsFrom1Perspective = await contractAs1.readMessage(acc18.address);
    console.log(`Messages (Acc1 perspective): ${msgsFrom1Perspective.length}`);

    const msgsFrom18Perspective = await contractAs18.readMessage(acc1.address);
    console.log(`Messages (Acc18 perspective): ${msgsFrom18Perspective.length}`);

    if (msgsFrom18Perspective.length > 0) {
        console.log("Last Message Content:", msgsFrom18Perspective[msgsFrom18Perspective.length - 1].content);
    } else {
        console.log("No messages found.");
    }
}

main().catch(console.error);
