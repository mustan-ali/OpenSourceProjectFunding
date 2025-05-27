import React, { useState } from "react";
import { ethers } from "ethers";
import "./Contribute.css";

export default function Contribute({ contract, reloadProjects }) {

    // State to manage contribution input and messages
    const [message, setMessage] = useState(""); // For displaying error/success messages
    const [contribution, setContribution] = useState({ projectId: "", amount: "" }); // Input values

    // Handles form submission
    async function handleSubmit(e) {
        e.preventDefault(); // Prevents default page reload

        if (!contract) return; // If contract is not loaded, exit early

        try {
            const projectId = Number(contribution.projectId); // Convert input to number
            const amountWei = ethers.parseEther(contribution.amount); // Convert ETH string to wei

            // Call the smart contract's contribute function with ETH
            const tx = await contract.contribute(projectId, { value: amountWei });
            await tx.wait(); // Wait for transaction to be mined

            alert("Contribution successful");

            // Reset form and reload project data
            setContribution({ projectId: "", amount: "" });
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Contribution failed: " + (err?.reason || "Unknown error")); // Show error message
        }
    }

    // Render the contribution form
    return (
        <div className="contribute">
            <h2>Contribute to Project</h2>
            <form onSubmit={handleSubmit}>
                {/* Input for project ID */}
                <input
                    required
                    type="number"
                    placeholder="Project ID"
                    value={contribution.projectId}
                    onChange={(e) => setContribution({ ...contribution, projectId: e.target.value })}
                />

                {/* Input for ETH amount */}
                <input
                    required
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="Amount (ETH)"
                    value={contribution.amount}
                    onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                />

                <button type="submit">Contribute</button>

                {/* Message shown only on error */}
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
