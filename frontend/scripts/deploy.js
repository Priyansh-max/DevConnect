async function main() {
  try {
    // Get the network
    const network = await ethers.provider.getNetwork();
    console.log("Deploying to network:", network.name, "chainId:", network.chainId);

    // Get the deployer's balance
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));

    // Deploy the contract
    const DevConnect = await ethers.getContractFactory("DevConnect");
    console.log("Deploying DevConnect...");
    const devConnect = await DevConnect.deploy();

    await devConnect.waitForDeployment();
    console.log("DevConnect deployed to:", await devConnect.getAddress());
  } catch (error) {
    console.error("Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 