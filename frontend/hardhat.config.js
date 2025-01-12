require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    b3testnet: {
      url: "https://sepolia.b3.fun",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1993,
      timeout: 60000,
      gasPrice: "auto"
    }
  }
}; 