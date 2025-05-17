import React, { useState } from "react";

export default function ProjectWithdraw({ contract, reloadProjects }) {
    const [projectId, setProjectId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleWithdraw() {
        if (!contract || projectId === "") return;
        setLoading(true);
        setMessage("");

        try {
            const tx = await contract.withdrawEarly(projectId);
            await tx.wait();
            setMessage("Withdrawal successful!");
            setProjectId("");
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Withdrawal failed: " + (err?.reason || "Unknown error"));
        }

        setLoading(false);
    }

    return (
        <div>
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
