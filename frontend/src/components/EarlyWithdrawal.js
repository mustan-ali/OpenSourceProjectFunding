import React, { useState } from "react";
import "./EarlyWithdrawal.css";

export default function ProjectWithdraw({ contract, reloadProjects }) {

    // State hooks
    const [projectId, setProjectId] = useState("");     // ID of the project to withdraw from
    const [loading, setLoading] = useState(false);      // UI loading state for button
    const [message, setMessage] = useState("");         // Message shown after action

    // Handles early withdrawal logic
    async function handleWithdraw() {
        if (!contract || projectId === "") return;

        setLoading(true);
        setMessage("");

        try {
            // Fetch the required early withdrawal fee from the contract
            const fee = await contract.getEarlyWithdrawalFee(projectId);

            // Call smart contract's early withdrawal method and send required ETH fee
            const tx = await contract.withdrawEarly(projectId, { value: fee });
            await tx.wait(); // Wait for transaction confirmation

            // Success
            setMessage("Withdrawal successful!");
            setProjectId("");
            reloadProjects(); // Refresh project data after withdrawal
        } catch (err) {
            console.error(err);
            // Show error message
            setMessage("Withdrawal failed: " + (err?.reason || err?.message || "Unknown error"));
        }

        setLoading(false);
    }

    // Render the withdrawal component
    return (
        <div className="withdraw">
            <h2>Withdraw Project Early</h2>

            {/* Input field for project ID */}
            <input
                type="number"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />

            {/* Withdraw button with loading state */}
            <button
                onClick={handleWithdraw}
                disabled={loading || projectId === ""}
            >
                {loading ? "Withdrawing..." : "Withdraw"}
            </button>

            {/* Feedback message */}
            {message && <p>{message}</p>}
        </div>
    );
}