import React from "react";
import { Link } from "react-router-dom";
import "./ProjectList.css";

export default function ProjectList({ projects, loading }) {
    if (loading) return <p>Loading projects...</p>;
    if (projects.length === 0) return <p>No projects yet</p>;

    return (
        <div className="project-list-container">
            <h2 className="project-heading">Projects</h2>
            <div className="project-list">
                {projects.map((p) => (
                    <div className="project-card" key={p.projectNumber}>
                        <div className="project-title-row">
                            <h3 className="project-title">
                                <span className="project-number">Project {p.projectNumber}</span> {p.name
                                    .split(" ")
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                            </h3>
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

                        <div className="project-info-group">
                            <p><span>Description:</span> {p.description}</p>
                            <p>
                                <span>URL:</span>{" "}
                                <a href={`https://${p.url}`} target="_blank" rel="noreferrer">
                                    {p.url}
                                </a>
                            </p>
                        </div>

                        <div className="project-info-group">
                            <p><span>Owner:</span> {p.owner}</p>
                            <p><span>Funding Goal:</span> {p.fundingGoal} ETH</p>
                            <p><span>Total Funds:</span> {p.totalFunds} ETH</p>
                            <p><span>Deadline:</span> {p.deadline.toLocaleString()}</p>
                        </div>

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
