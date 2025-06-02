# OpenSourceProjectFunding

A decentralized crowdfunding platform built on Ethereum allowing users to create, fund, and manage open-source projects with transparent fees and withdrawal options.

## Features

- Create open-source project campaigns with funding goals and deadlines
- Contribute Ether with a small contribution fee
- Early withdrawal option for project owners with a fee
- Admin-controlled fees (creation, contribution, withdrawal)
- Project status updates (completed, expired, withdrawn)
- Secure contract using OpenZeppelin’s ReentrancyGuard

## Technologies

- Solidity (0.8.20)
- OpenZeppelin Contracts
- React.js frontend with ethers.js for blockchain interactions
- Hardhat for local Ethereum development and testing

## Getting Started

<details>
  <summary>Steps to Run the Project</summary>

```bash
# Step 1: Compile Smart Contracts
# (Run this in Terminal 1, inside the Backend folder)
npx hardhat compile

# Step 2: Run Contract Tests
# (Still in Terminal 1)
npx hardhat test

# Step 3: Start Local Hardhat Node
# (Still in Terminal 1)
npx hardhat node
```

```bash
# Step 4: Deploy the Contract to Localhost Network
# (Open Terminal 2, inside the Backend folder)
npx hardhat run scripts/deploy.js --network localhost
```

```text
# Step 5: Update Contract Address and ABI
# - Copy the contract address printed after Step 4.
# - Copy the ABI from:
#   backend/artifacts/contracts/<ContractName>.sol/<ContractName>.json
# - Replace both in:
#   - backend/contract.js
#   - frontend/src/contract.js
```

```bash
# Step 6: Start the Backend Server
# (Open Terminal 3, inside the Backend folder)
node server.js
```

```bash
# Step 7: Start the Frontend App
# (Open Terminal 4, inside the Frontend folder)
npm start
```
</details>

<details>
  <summary>Steps to Connect Hardhat to MetaMask</summary>

```text
Step 1: Open MetaMask

Step 2: Click the network dropdown at the top (e.g., “Ethereum Mainnet”)

Step 3: Select “Add Network”

Step 4: Enter the following details:
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency Symbol: ETH
- Block Explorer URL: (Leave blank)

Step 5: Click “Save”

Step 6: Switch to the Hardhat Local network

---

Import a Hardhat Account:

Step 1: In MetaMask, go to Account menu → Import Account

Step 2: Paste a private key from one of the accounts listed in your Hardhat node terminal

Step 3: Click “Import”
```
</details>