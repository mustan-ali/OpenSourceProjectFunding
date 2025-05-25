import React, { useState } from "react";
import "./EarlyWithdrawal.css";

export default function ProjectWithdraw({ contract, reloadProjects }) {
    const [projectId, setProjectId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleWithdraw() {
        if (!contract || projectId === "") return;
        setLoading(true);
        setMessage("");

        try {
            // Get early withdrawal fee from the contract
            const fee = await contract.getEarlyWithdrawalFee(projectId);

            // Send transaction with required fee
            const tx = await contract.withdrawEarly(projectId, { value: fee });
            await tx.wait();

            setMessage("Withdrawal successful!");
            setProjectId("");
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Withdrawal failed: " + (err?.reason || err?.message || "Unknown error"));
        }

        setLoading(false);
    }

    return (
        <div className="withdraw">
            <h2>Withdraw Project Early</h2>
            <input
                type="number"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <button
                onClick={handleWithdraw}
                disabled={loading || projectId === ""}
            >
                {loading ? "Withdrawing..." : "Withdraw"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}
