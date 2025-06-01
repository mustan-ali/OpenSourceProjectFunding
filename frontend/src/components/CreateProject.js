import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./CreateProject.css";

export default function CreateProject({ contract, reloadProjects }) {

    // State to handle user input and messages
    const [message, setMessage] = useState(""); // Error/success messages
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        url: "",
        fundingGoal: "",
        deadline: "",
    });

    // Handles form submission
    async function handleSubmit(e) {
        e.preventDefault(); // Prevent page reload on form submit
        if (!contract) return;

        try {
            // Convert human-readable ETH to wei
            const fundingGoalWei = ethers.parseEther(newProject.fundingGoal);

            // Convert deadline from minutes to seconds
            const deadlineSeconds = Number(newProject.deadline) * 60;

            // Fetch required creation fee from contract
            const creationFee = await contract.creationFee();

            // Create project on-chain
            const tx = await contract.createProject(
                newProject.name,
                newProject.description,
                newProject.url,
                fundingGoalWei,
                deadlineSeconds,
                { value: creationFee } // Must send creation fee
            );

            await tx.wait(); // Wait for transaction confirmation
            alert("Project created!");

            // Reset form
            setNewProject({
                name: "",
                description: "",
                url: "",
                fundingGoal: "",
                deadline: "",
            });

            // Refresh project list in UI
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Project creation failed: " + (err?.reason || "Unknown error"));
        }
    }

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => setMessage(""), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    // Render the project creation form
    return (
        <div className="create-project">
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>

                {/* Project Name */}
                <input
                    required
                    placeholder="Name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />

                {/* Description */}
                <textarea
                    required
                    placeholder="Description"
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />

                {/* Project URL */}
                <input
                    required
                    placeholder="Project URL"
                    value={newProject.url}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                />

                {/* Funding Goal in ETH */}
                <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Funding Goal (ETH)"
                    value={newProject.fundingGoal}
                    onChange={(e) => setNewProject({ ...newProject, fundingGoal: e.target.value })}
                />

                {/* Deadline in minutes */}
                <input
                    required
                    type="number"
                    min="1"
                    placeholder="Deadline (minutes from now)"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                />

                <button type="submit">Create Project</button>

                {/* Show error message if any */}
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}