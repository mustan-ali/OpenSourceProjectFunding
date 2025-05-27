import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProjectContributions.css";

export default function ProjectContributions({ contract }) {
    // Get the projectId from the URL parameters (e.g., /projects/:projectId)
    const { projectId } = useParams();

    // State hooks
    const [contributions, setContributions] = useState([]); // Stores fetched contributions
    const [loading, setLoading] = useState(true);           // Controls loading state

    // Fetch contributions when component mounts or projectId/contract changes
    useEffect(() => {
        if (!contract) return;

        const fetchContributions = async () => {
            setLoading(true);

            try {
                // Query blockchain for ProjectContributed events related to this projectId
                const events = await contract.queryFilter(
                    contract.filters.ProjectContributed(Number(projectId))
                );

                // Map and format events for display
                const parsed = events.map((e) => ({
                    contributor: e.args.contributor,
                    amount: Number(e.args.amount) / 1e18, // Convert from wei to ETH
                    txHash: e.transactionHash,
                }));

                setContributions(parsed.reverse()); // Show newest first
            } catch (err) {
                console.error("Failed to fetch contributions:", err);
            }

            setLoading(false);
        };

        fetchContributions();
    }, [contract, projectId]);

    // Render contributions page
    return (
        <div className="contribution-page">
            <h2>Contributions to Project - {projectId}</h2>

            {/* Loading state */}
            {loading ? (
                <p>Loading...</p>

                // No contributions yet
            ) : contributions.length === 0 ? (
                <p>No contributions yet.</p>

                // Contributions table
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Contributor</th>
                            <th>Amount (ETH)</th>
                            <th>Transaction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contributions.map((c, idx) => (
                            <tr key={idx}>
                                <td>{c.contributor}</td>
                                <td>{c.amount.toFixed(4)}</td>
                                <td>{c.txHash}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
