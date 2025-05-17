import React from "react";

export default function ProjectList({ projects, loading }) {
    if (loading) return <p>Loading projects...</p>;
    if (projects.length === 0) return <p>No projects yet</p>;

    return (
        <div>
            {projects.map((p) => (
                <div key={p.projectNumber}>
                    <h3>Project #{p.projectNumber}</h3>
                    <h3>{p.name}</h3>
                    <p><span>Description:</span> {p.description}</p>
                    <p>
                        <span>URL:</span>{" "}
                        <a href={p.url} target="_blank" rel="noreferrer">
                            {p.url}
                        </a>
                    </p>
                    <p>Owner: {p.owner}</p>
                    <p>Funding Goal: {p.fundingGoal} ETH</p>
                    <p>Total Funds: {p.totalFunds} ETH</p>
                    <p>Deadline: {p.deadline.toLocaleString()}</p>
                    <p>Completed: {p.isCompleted ? "Yes" : "No"}</p>
                    <p>Expired: {p.isExpired ? "Yes" : "No"}</p>
                    <p>Withdrawn: {p.isWithdrawn ? "Yes" : "No"}</p>
                </div>

            ))}
        </div>
    );
}
