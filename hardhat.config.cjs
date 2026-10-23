require("dotenv").config();
require("dotenv").config({ path: ".env.local", override: true });
require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 1337,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 1337,
        },
        polygon: {
            url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
            chainId: 137,
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 60) ? [process.env.PRIVATE_KEY] : [],
        },
    },
    paths: {
        artifacts: "./src/artifacts",
    },
};
