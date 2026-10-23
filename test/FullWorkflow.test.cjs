const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Full Workflow', function () {
    let chat, owner, friend;

    beforeEach(async () => {
        [owner, friend] = await ethers.getSigners();
        const ChatApp = await ethers.getContractFactory('ChatApp');
        chat = await ChatApp.deploy();
        await chat.waitForDeployment();
    });

    it('registers users, adds a friend, sends a message and reads it back', async () => {
        // Register owner (Alice)
        await chat.createAccount('Alice');
        expect(await chat.checkUserExists(owner.address)).to.be.true;

        // Register friend (Bob)
        await chat.connect(friend).createAccount('Bob');
        expect(await chat.checkUserExists(friend.address)).to.be.true;

        // Owner adds friend
        await chat.addFriend(friend.address, 'Bob');

        // Owner sends a message to friend
        const msg = 'Hello from Alice!';
        await chat.sendMessage(friend.address, msg);

        // Verify the message is stored
        const msgs = await chat.readMessage(friend.address);
        expect(msgs).to.have.length(1);
        expect(msgs[0].content).to.equal(msg);
        expect(msgs[0].sender).to.equal(owner.address);
    });
});
