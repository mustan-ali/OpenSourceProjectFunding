const mongoose = require("mongoose"); // MongoDB object modeling tool
const { ethers } = require("ethers"); // Ethereum library
const Project = require("./model/Project"); // Mongoose model for Project
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require("./contract"); // Smart contract details

// Main async function to connect to MongoDB and listen for smart contract events
async function main() {
    // Connect to the MongoDB database
    await mongoose.connect("mongodb://localhost:27017/OpenSourceProjectFunding");
    console.log("MongoDB connected");

    // Create a JSON-RPC provider for the local Ethereum network
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Instantiate the smart contract using its address, ABI, and provider
    const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
    );

    // Listen for the ProjectCreated event from the smart contract
    contract.on("ProjectCreated", async (projectId, owner, name, fundingGoal, url) => {
        try {
            const projectNum = Number(projectId);

            // Check if the project already exists in the database
            const existing = await Project.findOne({ projectNumber: projectNum });
            if (existing) return; // Do not add duplicates

            // Create and save a new project document
            const project = new Project({
                projectNumber: projectNum,
                owner,
                name,
                url,
                fundingGoal: parseFloat(ethers.formatEther(fundingGoal)), // Convert Wei to Ether
                totalFunds: 0,
                isCompleted: false,
                deadline: new Date(),
                isExpired: false,
                isWithdrawn: false,
                contributions: [],
            });

            await project.save();
            console.log(`Project ${projectNum} saved`);
        } catch (err) {
            console.error("ProjectCreated error:", err);
        }
    });

    // Listen for the ProjectContributed event and update project contributions
    contract.on("ProjectContributed", async (projectId, contributor, amount) => {
        try {
            const projectNum = Number(projectId);

            // Find the project in the database
            const project = await Project.findOne({ projectNumber: projectNum });
            if (!project) {
                console.warn(`Project ${projectNum} not found for contribution`);
                return;
            }

            // Convert amount from Wei to Ether
            const contributionAmount = Number(amount) / 1e18;

            // Add the contribution to the project
            project.contributions.push({ contributor, amount: contributionAmount });
            project.totalFunds += contributionAmount;

            await project.save();
            console.log(`Added contribution of ${contributionAmount} ETH to project ${projectNum}`);
        } catch (err) {
            console.error("ProjectContributed error:", err);
        }
    });

    // Listen for the ProjectWithdrawn event and mark the project as withdrawn
    contract.on("ProjectWithdrawn", async (projectId) => {
        try {
            const projectNum = Number(projectId);
            const project = await Project.findOne({ projectNumber: projectNum });
            if (!project) return;

            project.isWithdrawn = true;
            await project.save();
            console.log(`Project ${projectNum} marked as withdrawn`);
        } catch (err) {
            console.error("ProjectWithdrawn error:", err);
        }
    });

    // Listen for the ProjectExpired event and mark the project as expired
    contract.on("ProjectExpired", async (projectId) => {
        try {
            const projectNum = Number(projectId);
            const project = await Project.findOne({ projectNumber: projectNum });
            if (!project) return;

            project.isExpired = true;
            await project.save();
            console.log(`Project ${projectNum} marked as expired`);
        } catch (err) {
            console.error("ProjectExpired error:", err);
        }
    });

    // Listen for the ProjectCompleted event and mark the project as completed
    contract.on("ProjectCompleted", async (projectId) => {
        try {
            const projectNum = Number(projectId);
            const project = await Project.findOne({ projectNumber: projectNum });
            if (!project) return;

            project.isCompleted = true;
            await project.save();
            console.log(`Project ${projectNum} marked as completed`);
        } catch (err) {
            console.error("ProjectCompleted error:", err);
        }
    });

    console.log("Listening for contract events...");
}

// Start the main function and catch any unhandled errors
main().catch(err => {
    console.error(err);
    process.exit(1);
});