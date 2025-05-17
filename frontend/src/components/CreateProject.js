import React, { useState } from "react";
import { ethers } from "ethers";

export default function CreateProject({ contract, reloadProjects }) {
    const [message, setMessage] = useState("");
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        url: "",
        fundingGoal: "",
        deadline: "",
    });

    async function handleSubmit(e) {
        e.preventDefault();
        if (!contract) return;

        try {
            const fundingGoalWei = ethers.parseEther(newProject.fundingGoal);
            const deadlineSeconds = Number(newProject.deadline);

            // const creationFee = ethers.parseEther("0.01");
            const creationFee = await contract.creationFee();

            const tx = await contract.createProject(
                newProject.name,
                newProject.description,
                newProject.url,
                fundingGoalWei,
                deadlineSeconds,
                { value: creationFee }
            );
            await tx.wait();
            alert("Project created!");
            setNewProject({
                name: "",
                description: "",
                url: "",
                fundingGoal: "",
                deadline: "",
            });
            reloadProjects();
        } catch (err) {
            console.error(err);
            setMessage("Project creation failed: " + (err?.reason || "Unknown error"));
        }
    }

    return (
        <>
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
                <input
                    required
                    placeholder="Name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <textarea
                    required
                    placeholder="Description"
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <input
                    required
                    placeholder="Project URL"
                    value={newProject.url}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                />
                <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Funding Goal (ETH)"
                    value={newProject.fundingGoal}
                    onChange={(e) => setNewProject({ ...newProject, fundingGoal: e.target.value })}
                />
                <input
                    required
                    type="number"
                    min="1"
                    placeholder="Deadline (seconds from now)"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                />
                <button type="submit">Create Project</button>
                {message && <p>{message}</p>}
            </form>
        </>
    );
}
