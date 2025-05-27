/* eslint-disable */
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

// Component imports
import ProjectList from "./components/ProjectList";
import CreateProject from "./components/CreateProject";
import Contribute from "./components/Contribute";
import EarlyWithdrawal from "./components/EarlyWithdrawal";
import AdminPanel from "./components/AdminPanel";
import ProjectContributions from "./components/ProjectContributions";

import "./App.css";

export default function App() {

  // React State Hooks
  const [provider, setProvider] = useState(null);        // Ethers provider
  const [signer, setSigner] = useState(null);            // Connected user's signer
  const [contract, setContract] = useState(null);        // Smart contract instance
  const [account, setAccount] = useState(null);          // User Ethereum address

  const [projects, setProjects] = useState([]);          // List of all loaded projects
  const [loadingProjects, setLoadingProjects] = useState(false); // Loading flag

  // Wallet Connection
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    // Create a new provider and request access to user's accounts
    const newProvider = new ethers.BrowserProvider(window.ethereum);
    await newProvider.send("eth_requestAccounts", []);
    const newSigner = await newProvider.getSigner();
    const address = await newSigner.getAddress();

    // Instantiate the smart contract using the signer
    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      newSigner
    );

    // Save to state
    setProvider(newProvider);
    setSigner(newSigner);
    setAccount(address);
    setContract(contractInstance);

    // Optionally fetch contract parameters (fees, etc.)
    await fetchContractDetails(contractInstance);
  }

  // Fetch basic contract config
  async function fetchContractDetails(contractInstance) {
    try {
      const creation = await contractInstance.creationFee();
      const contribution = await contractInstance.contributionFee();
      const earlyWithdrawal = await contractInstance.earlyWithdrawalFee();

      // These can be used if you add state to show them in the UI
      setCreationFee(ethers.formatEther(creation));
      setContributionFee(contribution.toString());
      setEarlyWithdrawalFee(earlyWithdrawal.toString());
    } catch (err) {
      console.error("Failed to fetch contract details:", err);
    }
  }

  // Disconnect Wallet
  function disconnectWallet() {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
  }

  // Load all projects from contract
  async function loadProjects() {
    if (!contract) return;
    setLoadingProjects(true);
    try {
      const count = await contract.getProjectCount();
      const loadedProjects = [];

      // Fetch each project individually
      for (let i = 0; i < count; i++) {
        const p = await contract.projects(i);
        loadedProjects.push({
          projectNumber: Number(p[0]),
          owner: p[1],
          name: p[2],
          description: p[3],
          url: p[4],
          fundingGoal: ethers.formatEther(p[5]),
          totalFunds: ethers.formatEther(p[6]),
          isCompleted: p[7],
          deadline: new Date(Number(p[8]) * 1000), // Convert UNIX timestamp to JS Date
          isExpired: p[9],
          isWithdrawn: p[10],
        });
      }

      setProjects(loadedProjects);
    } catch (e) {
      console.error(e);
    }
    setLoadingProjects(false);
  }

  // React Lifecycle: load projects if contract updates
  useEffect(() => {
    if (contract) loadProjects();
    // eslint-disable-next-line
  }, [contract]);

  // Listen for account changes (MetaMask)
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet(); // User disconnected account
      } else {
        connectWallet();    // Reconnect on account change
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);


  return (
    <Router>
      <div>
        {/* App Header with Wallet Info */}
        <div className="wallet-header">
          <div className="left-section">
            <h1>Open Source Project Funding</h1>
            {provider && <p className="account-info">Connected as: {account}</p>}
          </div>

          {/* Connect or Disconnect button */}
          {!provider ? (
            <button className="wallet-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <button className="wallet-button" onClick={disconnectWallet}>
              Disconnect
            </button>
          )}
        </div>

        {/* Only show routes once wallet is connected */}
        {provider && (
          <Routes>
            {/* Home Route: Admin + Create + Contribute + Withdraw + Project List */}
            <Route
              path="/"
              element={
                <>
                  <div className="three-column-layout">
                    <div className="column admin-panel-col">
                      <AdminPanel contract={contract} />
                    </div>

                    <div className="column create-project-col">
                      <CreateProject contract={contract} reloadProjects={loadProjects} />
                    </div>

                    <div className="column contribute-withdraw-col">
                      <Contribute contract={contract} reloadProjects={loadProjects} />
                      <EarlyWithdrawal contract={contract} reloadProjects={loadProjects} />
                    </div>
                  </div>

                  {/* Display project list below form actions */}
                  <ProjectList projects={projects} loading={loadingProjects} />
                </>
              }
            />

            {/* Route for viewing contributions to a specific project */}
            <Route
              path="/project/:projectId/contributions"
              element={<ProjectContributions contract={contract} />}
            />
          </Routes>
        )}
      </div>
    </Router>
  );
}