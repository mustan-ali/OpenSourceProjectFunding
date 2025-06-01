import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
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

            // Show confirm dialog with the fee (converted to ETH string)
            const feeInEth = ethers.formatEther(fee);
            const userConfirmed = window.confirm(
                `The early withdrawal fee is ${feeInEth} ETH.\nDo you want to proceed?`
            );

            if (!userConfirmed) {
                setMessage("Withdrawal cancelled by user.");
                setLoading(false);
                return; // Exit without calling the transaction
            }

            // User confirmed, call the smart contract withdrawal function with the fee
            const tx = await contract.withdrawEarly(projectId, { value: fee });
            await tx.wait(); // Wait for confirmation

            setMessage("Withdrawal successful!");
            setProjectId("");
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Withdrawal failed: " + (err?.reason || err?.message || "Unknown error"));
        }

        setLoading(false);
    }

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

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