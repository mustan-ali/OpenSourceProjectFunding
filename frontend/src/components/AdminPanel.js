import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./AdminPanel.css";

export default function AdminPanel({ contract }) {
    const [creationFee, setCreationFee] = useState(null);
    const [contributionFee, setContributionFee] = useState(null);
    const [earlyWithdrawalFee, setEarlyWithdrawalFee] = useState(null);

    const [newCreationFee, setNewCreationFee] = useState("");
    const [newContributionFee, setNewContributionFee] = useState("");
    const [newEarlyWithdrawalFee, setNewEarlyWithdrawalFee] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchDetails() {
            if (!contract) return;
            try {
                const creation = await contract.creationFee();
                const contribution = await contract.contributionFee();
                const earlyWithdrawal = await contract.earlyWithdrawalFee();

                setCreationFee(ethers.formatEther(creation));
                setContributionFee(contribution.toString());
                setEarlyWithdrawalFee(earlyWithdrawal.toString());
            } catch (err) {
                console.error("Failed to fetch contract details:", err);
                setMessage("Failed to fetch contract details: " + (err?.reason || "Unknown error"));
            }
        }

        fetchDetails();
    }, [contract]);

    async function updateCreationFee() {
        if (!contract || !newCreationFee) {
            setMessage("Enter a new creation fee");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const feeWei = ethers.parseEther(newCreationFee);
            const tx = await contract.setCreationFee(feeWei);
            await tx.wait();
            setNewCreationFee("");
            const updated = await contract.creationFee();
            setCreationFee(ethers.formatEther(updated));
            setMessage("Creation fee updated successfully");
        } catch (err) {
            console.error("Failed to update creation fee:", err);
            setMessage("Failed to update creation fee: " + (err?.reason || "Unknown error"));
        }
        setLoading(false);
    }

    async function updateContributionFee() {
        if (!contract || !newContributionFee) {
            setMessage("Enter a new contribution fee");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const feeInt = parseInt(newContributionFee);
            if (isNaN(feeInt) || feeInt < 0) throw new Error("Invalid contribution fee");
            const tx = await contract.setContributionFee(feeInt);
            await tx.wait();
            setNewContributionFee("");
            const updated = await contract.contributionFee();
            setContributionFee(updated.toString());
            setMessage("Contribution fee updated successfully");
        } catch (err) {
            console.error("Failed to update contribution fee:", err);
            setMessage("Failed to update contribution fee: " + (err?.reason || "Unknown error"));
        }
        setLoading(false);
    }

    async function updateEarlyWithdrawalFee() {
        if (!contract || !newEarlyWithdrawalFee) {
            setMessage("Enter a new early withdrawal fee");
            return;
        }
        setLoading(true);
        setMessage("");
        try {
            const feeInt = parseInt(newEarlyWithdrawalFee);
            if (isNaN(feeInt) || feeInt < 0) throw new Error("Invalid early withdrawal fee");
            const tx = await contract.setEarlyWithdrawalFee(feeInt);
            await tx.wait();
            setNewEarlyWithdrawalFee("");
            const updated = await contract.earlyWithdrawalFee();
            setEarlyWithdrawalFee(updated.toString());
            setMessage("Early withdrawal fee updated successfully");
        } catch (err) {
            console.error("Failed to update early withdrawal fee:", err);
            setMessage("Failed to update early withdrawal fee: " + (err?.reason || "Unknown error"));
        }
        setLoading(false);
    }

    if (!contract) return null;

    return (
        <div className="admin-panel">
            <h3>Admin Panel</h3>

            <p><strong>Creation Fee:</strong> {creationFee ? `${creationFee} ETH` : "Loading..."}</p>
            <input
                type="text"
                placeholder="New creation fee (ETH)"
                value={newCreationFee}
                onChange={(e) => setNewCreationFee(e.target.value)}
                disabled={loading}
            />
            <button onClick={updateCreationFee} disabled={loading}>Update Creation Fee</button>

            <p><strong>Contribution Fee:</strong> {contributionFee ? `${contributionFee}%` : "Loading..."}</p>
            <input
                type="number"
                placeholder="New contribution fee (%)"
                value={newContributionFee}
                onChange={(e) => setNewContributionFee(e.target.value)}
                disabled={loading}
                min="0"
            />
            <button onClick={updateContributionFee} disabled={loading}>Update Contribution Fee</button>

            <p><strong>Early Withdrawal Fee:</strong> {earlyWithdrawalFee ? `${earlyWithdrawalFee}%` : "Loading..."}</p>
            <input
                type="number"
                placeholder="New early withdrawal fee (%)"
                value={newEarlyWithdrawalFee}
                onChange={(e) => setNewEarlyWithdrawalFee(e.target.value)}
                disabled={loading}
                min="0"
            />
            <button onClick={updateEarlyWithdrawalFee} disabled={loading}>Update Early Withdrawal Fee</button>

            {message && <p className="message">{message}</p>}

        </div>
    );
}
