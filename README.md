# zkVerify Space Hacker Game

A privacy-preserving space mining game that uses zkVerify and RISC0 to verify game sessions and mint tokens without revealing gameplay strategies.

## Overview

This project demonstrates a novel use case for zero-knowledge proofs in gaming: proving legitimate gameplay achievements while keeping player strategies private. Built for the zkVerify + Horizen hackathon, it showcases how ZK proofs can create fair, verifiable gaming experiences.

## Architecture

The system consists of three main components:

- **Frontend**: Next.js space mining game with decision trees and upgrades
- **ZK Service**: RISC0 proof generation and zkVerify aggregation service
- **Smart Contract**: Token minting contract with zkVerify proof verification

## Key Features

### Privacy-Preserving Gaming

- Players destroy blocks and make strategic decisions in a space mining game
- Game sessions are cryptographically proven without exposing strategies
- Decision trees, timing patterns, and exact gameplay remain confidential
- Other players cannot reverse-engineer successful approaches

### zkVerify Integration

- RISC0 circuits validate game logic and session integrity
- Proofs are aggregated through zkVerify's relayer service
- Smart contracts verify aggregated proofs on-chain before minting tokens
- Complete end-to-end ZK workflow from game to token rewards

### Gasless User Experience

- Backend sponsors all gas fees for seamless gameplay
- Players receive tokens automatically after proof verification
- No manual transaction signing required for rewards

## Technical Implementation

### Game Verification Circuit

The RISC0 guest program validates:

- Player address and session timestamps
- Blocks destroyed count and decision consistency
- Token balance calculations
- Session integrity and anti-cheat measures

### Smart Contract Verification

```solidity
function airdropTokens(
    address _player,
    uint256 _blocksDestroyed,
    // zkVerify parameters
    uint256 _domainId,
    uint256 _aggregationId,
    bytes32[] calldata _merklePath,
    uint256 _leafCount,
    uint256 _index,
    bytes memory _publicInputsHash
) external onlyOwner
```

Contract calls zkVerify's `verifyProofAggregation` to validate proofs before minting tokens.

## Getting Started

### Prerequisites

- Rust toolchain for RISC0 development
- Node.js 18+ for frontend
- Horizen testnet wallet with funds for deployment

### Environment Setup

1. **ZK Service** (in `zk-service/`):

```bash
cp env.template .env
# Add your RELAYER_API_KEY
cargo run
```

2. **Smart Contract** (in `contracts/`):
   Deploy `gameToken.sol` with:

- Token name/symbol
- zkVerify contract address
- RISC0 circuit image ID (vkey)

3. **Frontend** (in `frontend/`):

```bash
npm install
# Configure environment variables
npm run dev
```

### Environment Variables

```env
# ZK Service
RELAYER_API_KEY=your_zkverify_relayer_key

# Frontend
GAME_TOKEN_CONTRACT_ADDRESS=deployed_contract_address
RPC_URL=horizen_testnet_rpc
AIRDROP_PRIVATE_KEY=backend_wallet_private_key
```

## Project Structure

```
├── contracts/           # Smart contract with zkVerify integration
├── frontend/           # Next.js game frontend
│   ├── Components/     # Game UI components
│   ├── app/           # App router pages and API
│   └── hooks/         # React hooks for game logic
└── zk-service/        # RISC0 proof generation service
    ├── host/          # Proof generation server
    └── methods/       # RISC0 guest circuit code
```

## Hackathon Submission

### zkVerify Track

- Complete RISC0 → zkVerify → Smart Contract integration
- Novel gaming application demonstrating practical ZK utility
- End-to-end proof aggregation and verification workflow

### Horizen Privacy Track

- Privacy-preserving gameplay verification
- Protects player strategies while ensuring fair play
- Deployed on Horizen testnet using their privacy infrastructure
- Demonstrates practical privacy use case beyond traditional applications

## How It Works

1. **Play Game**: Users connect wallet and play space mining game
2. **Generate Proof**: RISC0 circuit creates proof of game session
3. **Aggregate**: zkVerify bundles proof with others for efficiency
4. **Verify & Mint**: Smart contract verifies proof and mints reward tokens
5. **Privacy Maintained**: Strategies remain confidential throughout

## Demo

The game features:

- Real-time space mining with particle effects
- Strategic decision trees affecting gameplay
- Multiple spaceship configurations
- Automatic token rewards for legitimate play

Players can prove they earned rewards without revealing their winning strategies to competitors.

## Future Development

- Multi-player tournaments with private leaderboards
- Advanced ZK circuits for more complex game mechanics
- Integration with additional privacy-preserving game features
- Cross-chain deployment using zkVerify's multi-chain support

## License

Apache-2.0 - Built for zkVerify + Horizen Hackathon
