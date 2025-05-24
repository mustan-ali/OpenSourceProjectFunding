import React, { useState } from "react";
import { ethers } from "ethers";
import "./Contribute.css";


export default function Contribute({ contract, reloadProjects }) {
    const [message, setMessage] = useState("");
    const [contribution, setContribution] = useState({ projectId: "", amount: "" });

    async function handleSubmit(e) {
        e.preventDefault();
        if (!contract) return;

        try {
            const projectId = Number(contribution.projectId);
            const amountWei = ethers.parseEther(contribution.amount);
            const tx = await contract.contribute(projectId, { value: amountWei });
            await tx.wait();
            alert("Contribution successful");
            setContribution({ projectId: "", amount: "" });
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Contribution failed: " + (err?.reason || "Unknown error"));
        }
    }

    return (
        <div className="contribute">
            <h2>Contribute to Project</h2>
            <form onSubmit={handleSubmit}>
                <input
                    required
                    type="number"
                    placeholder="Project ID"
                    value={contribution.projectId}
                    onChange={(e) => setContribution({ ...contribution, projectId: e.target.value })}
                />
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
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
