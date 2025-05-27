// Import the Hardhat Runtime Environment (HRE)
const hre = require("hardhat");

async function main() {
    // Get a contract factory for the OpenSourceProjectFunding contract
    const factory = await hre.ethers.getContractFactory("OpenSourceProjectFunding");

    // Define the constructor arguments
    const creationFee = hre.ethers.parseEther("10"); // Fee required to create a project (in ETH)
    const contributionFee = 5; // Fee percentage taken from each contribution
    const earlyWithdrawalFee = 10; // Fee percentage required to withdraw early

    // Deploy the contract with the specified constructor arguments
    const contract = await factory.deploy(creationFee, contributionFee, earlyWithdrawalFee);

    // Wait for the contract deployment to complete
    await contract.waitForDeployment();

    // Log the deployed contract address to the console
    console.log("Contract deployed to:", await contract.getAddress());
}

// Call the main function and handle any errors
main().catch((err) => {
    console.error(err);         // Print error message to console
    process.exitCode = 1;       // Exit the process with error code 1
});
