/* eslint-disable */
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

import ProjectList from "./components/ProjectList";
import CreateProject from "./components/CreateProject";
import Contribute from "./components/Contribute";
import EarlyWithdrawal from "./components/EarlyWithdrawal";
import AdminPanel from "./components/AdminPanel";

import "./App.css";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [creationFee, setCreationFee] = useState(null);
  const [contributionFee, setContributionFee] = useState(null);
  const [earlyWithdrawalFee, setEarlyWithdrawalFee] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const newProvider = new ethers.BrowserProvider(window.ethereum);
    await newProvider.send("eth_requestAccounts", []);
    const newSigner = await newProvider.getSigner();
    const address = await newSigner.getAddress();

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      newSigner
    );

    setProvider(newProvider);
    setSigner(newSigner);
    setAccount(address);
    setContract(contractInstance);

    await fetchContractDetails(contractInstance);
  }

  async function fetchContractDetails(contractInstance) {
    try {
      const creation = await contractInstance.creationFee();
      const contribution = await contractInstance.contributionFee();
      const earlyWithdrawal = await contractInstance.earlyWithdrawalFee();

      setCreationFee(ethers.formatEther(creation));
      setContributionFee(contribution.toString());
      setEarlyWithdrawalFee(earlyWithdrawal.toString());
    } catch (err) {
      console.error("Failed to fetch contract details:", err);
    }
  }

  function disconnectWallet() {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);

    setCreationFee(null);
    setContributionFee(null);
    setEarlyWithdrawalFee(null);
  }

  async function loadProjects() {
    if (!contract) return;
    setLoadingProjects(true);
    try {
      const count = await contract.getProjectCount();
      const loadedProjects = [];
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
          deadline: new Date(Number(p[8]) * 1000),
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

  useEffect(() => {
    if (contract) loadProjects();
    // eslint-disable-next-line
  }, [contract]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <div>
      <div className="wallet-header">
        <div className="left-section">
          <h1>Open Source Project Funding</h1>
          {provider && <p className="account-info">Connected as: {account}</p>}
        </div>

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

      {provider && (
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

          <ProjectList projects={projects} loading={loadingProjects} />
        </>
      )}
    </div>
  );
}
