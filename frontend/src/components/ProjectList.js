import React from "react";
import { Link } from "react-router-dom";
import "./ProjectList.css";

export default function ProjectList({ projects, loading }) {

    // Conditional UI based on loading or empty data
    if (loading) return <p>Loading projects...</p>;
    if (projects.length === 0) return <p>No projects yet</p>;

    // Render list of project cards
    return (
        <div className="project-list-container">
            <h2 className="project-heading">Projects</h2>

            <div className="project-list">
                {projects.map((p) => (
                    <div className="project-card" key={p.projectNumber}>
                        {/* Header with project name and status */}
                        <div className="project-title-row">
                            <h3 className="project-title">
                                <span className="project-number">Project {p.projectNumber}</span>{" "}
                                {
                                    // Capitalize each word in the project name
                                    p.name
                                        .split(" ")
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ")
                                }
                            </h3>

                            {/* Dynamic status badge */}
                            <div className="project-status">
                                {p.isExpired ? (
                                    <span className="status-badge status-expired">Expired</span>
                                ) : p.isWithdrawn ? (
                                    <span className="status-badge status-withdrawn">Withdrawn</span>
                                ) : (
                                    <span className={`status-badge ${p.isCompleted ? "status-completed" : "status-ongoing"}`}>
                                        {p.isCompleted ? "Completed" : "Ongoing"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Project details section 1: Description and external URL */}
                        <div className="project-info-group">
                            <p><span>Description:</span> {p.description}</p>
                            <p>
                                <span>URL:</span>{" "}
                                <a href={`https://${p.url}`} target="_blank" rel="noreferrer">
                                    {p.url}
                                </a>
                            </p>
                        </div>

                        {/* Project details section 2: Ownership and financials */}
                        <div className="project-info-group">
                            <p><span>Owner:</span> {p.owner}</p>
                            <p><span>Funding Goal:</span> {p.fundingGoal} ETH</p>
                            <p><span>Total Funds:</span> {p.totalFunds} ETH</p>
                            <p><span>Deadline:</span> {p.deadline.toLocaleString()}</p>
                        </div>

                        {/* Link to project contribution history */}
                        <div className="view-contribution-button">
                            <Link to={`/project/${p.projectNumber}/contributions`} className="view-btn">
                                View Contributions
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
