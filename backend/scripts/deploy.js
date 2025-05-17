const hre = require("hardhat");

async function main() {
    const factory = await hre.ethers.getContractFactory("OpenSourceProjectFunding");

    const creationFee = hre.ethers.parseEther("0.099");
    const contributionFee = 5;
    const earlyWithdrawalFee = 10;

    const contract = await factory.deploy(creationFee, contributionFee, earlyWithdrawalFee);
    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
