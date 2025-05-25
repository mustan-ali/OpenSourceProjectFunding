import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProjectContributions.css";

export default function ProjectContributions({ contract }) {
    const { projectId } = useParams();
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!contract) return;

        const fetchContributions = async () => {
            setLoading(true);
            try {
                const events = await contract.queryFilter(
                    contract.filters.ProjectContributed(Number(projectId))
                );

                const parsed = events.map((e) => ({
                    contributor: e.args.contributor,
                    amount: Number(e.args.amount) / 1e18,
                    txHash: e.transactionHash,
                }));

                setContributions(parsed.reverse());
            } catch (err) {
                console.error("Failed to fetch contributions:", err);
            }
            setLoading(false);
        };

        fetchContributions();
    }, [contract, projectId]);

    return (
        <div className="contribution-page">
            <h2>Contributions to Project - {projectId}</h2>
            {loading ? (
                <p>Loading...</p>
            ) : contributions.length === 0 ? (
                <p>No contributions yet.</p>
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
