# Arbitrage Bot using Uniswap and SushiSwap

This script monitors price differences between Uniswap and SushiSwap for a selected token pair. It checks for arbitrage opportunities and logs price differences.

## Prerequisites

To run this script, you'll need the following:

- Node.js installed on your machine.
- An Infura project ID for accessing the Ethereum mainnet.
- An Etherscan API key to fetch smart contract ABIs.
- A `.env` file with the following environment variables:
  - `INFURA_PROJECT_ID`: Your Infura project ID.
  - `ETHERSCAN_API_KEY`: Your Etherscan API key.
  - `PRIVATE_KEY`: (Optional) Your Ethereum account private key.

## Installation

1. Clone the repository or copy the script files.
2. Run `npm install` to install the necessary dependencies.

   ```bash
   npm install
