// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// zkVerify interface
interface IVerifyProofAggregation {
    function verifyProofAggregation(
        uint256 _domainId,
        uint256 _aggregationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external view returns (bool);
}

contract GameToken is ERC20, Ownable, ReentrancyGuard {
    // zkVerify proving system constants for RISC0
    bytes32 public constant PROVING_SYSTEM_ID =
        keccak256(abi.encodePacked("risc0"));
    bytes32 public constant VERSION_HASH = sha256(abi.encodePacked(""));

    // zkVerify contract address
    address public zkVerify;

    // Your RISC0 circuit's vkey (image ID)
    bytes32 public vkey;

    // Track airdrops to prevent double-claims for same proof
    mapping(bytes32 => bool) public usedProofs;

    // Track user airdrops for analytics
    mapping(address => uint256) public totalAirdropsReceived;
    mapping(address => uint256) public lastAirdropTime;

    // Reward tiers based on blocks destroyed
    struct RewardTier {
        uint256 minBlocks;
        uint256 maxBlocks;
        uint256 tokenReward;
    }

    RewardTier[] public rewardTiers;

    // Events
    event TokensAirdropped(
        address indexed player,
        uint256 blocksDestroyed,
        uint256 tokensAwarded,
        string aggregationId
    );

    event RewardTierUpdated(
        uint256 indexed tier,
        uint256 minBlocks,
        uint256 maxBlocks,
        uint256 reward
    );

    constructor(
        string memory _name,
        string memory _symbol,
        address _zkVerify,
        bytes32 _vkey
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        zkVerify = _zkVerify;
        vkey = _vkey;

        // Initialize default reward tiers (18 decimals)
        rewardTiers.push(RewardTier(1, 50, 10 * 10 ** 18)); // 10 tokens for 1-50 blocks
        rewardTiers.push(RewardTier(51, 200, 50 * 10 ** 18)); // 50 tokens for 51-200 blocks
        rewardTiers.push(RewardTier(201, 500, 150 * 10 ** 18)); // 150 tokens for 201-500 blocks
        rewardTiers.push(RewardTier(501, 1000, 400 * 10 ** 18)); // 400 tokens for 501-1000 blocks
        rewardTiers.push(RewardTier(1001, type(uint256).max, 1000 * 10 ** 18)); // 1000 tokens for 1000+ blocks
    }

    /**
     * @dev Airdrop tokens with zkVerify proof verification
     * @param _player Address to receive tokens
     * @param _blocksDestroyed Number of blocks destroyed in game session
     * @param _aggregationId Unique identifier from proof aggregation (string for events)
     * @param _proofHash Hash of the proof data to prevent replays
     * @param _domainId The domain ID from zkVerify
     * @param _aggregationIdNum The aggregation ID as number for zkVerify call
     * @param _merklePath Merkle proof path
     * @param _leafCount Number of leaves in the merkle tree
     * @param _index Leaf index in the merkle tree
     * @param _publicInputsHash Hash of the public inputs from RISC0 circuit
     */
    function airdropTokens(
        address _player,
        uint256 _blocksDestroyed,
        string memory _aggregationId,
        bytes32 _proofHash,
        uint256 _domainId,
        uint256 _aggregationIdNum,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index,
        bytes memory _publicInputsHash
    ) external onlyOwner nonReentrant {
        require(_player != address(0), "Invalid player address");
        require(_blocksDestroyed > 0, "Must destroy at least 1 block");
        require(!usedProofs[_proofHash], "Proof already used");

        // Generate leaf digest for zkVerify verification
        bytes32 leaf = keccak256(
            abi.encodePacked(
                PROVING_SYSTEM_ID,
                vkey,
                VERSION_HASH,
                keccak256(abi.encodePacked(_publicInputsHash))
            )
        );

        // Verify the aggregation proof with zkVerify
        require(
            IVerifyProofAggregation(zkVerify).verifyProofAggregation(
                _domainId,
                _aggregationIdNum,
                leaf,
                _merklePath,
                _leafCount,
                _index
            ),
            "Invalid aggregation proof"
        );

        // Mark proof as used to prevent replay attacks
        usedProofs[_proofHash] = true;

        // Calculate reward based on blocks destroyed
        uint256 tokenReward = calculateReward(_blocksDestroyed);

        // Update player stats
        totalAirdropsReceived[_player] += tokenReward;
        lastAirdropTime[_player] = block.timestamp;

        // Mint tokens to player
        _mint(_player, tokenReward);

        emit TokensAirdropped(
            _player,
            _blocksDestroyed,
            tokenReward,
            _aggregationId
        );
    }

    /**
     * @dev Legacy airdrop function without zkVerify (for backwards compatibility)
     */
    function airdropTokensLegacy(
        address _player,
        uint256 _blocksDestroyed,
        string memory _aggregationId,
        bytes32 _proofHash
    ) external onlyOwner nonReentrant {
        require(_player != address(0), "Invalid player address");
        require(_blocksDestroyed > 0, "Must destroy at least 1 block");
        require(!usedProofs[_proofHash], "Proof already used");

        // Mark proof as used to prevent replay attacks
        usedProofs[_proofHash] = true;

        // Calculate reward based on blocks destroyed
        uint256 tokenReward = calculateReward(_blocksDestroyed);

        // Update player stats
        totalAirdropsReceived[_player] += tokenReward;
        lastAirdropTime[_player] = block.timestamp;

        // Mint tokens to player
        _mint(_player, tokenReward);

        emit TokensAirdropped(
            _player,
            _blocksDestroyed,
            tokenReward,
            _aggregationId
        );
    }

    /**
     * @dev Batch airdrop to multiple players (gas efficient)
     */
    function batchAirdropTokens(
        address[] memory _players,
        uint256[] memory _blocksDestroyed,
        string[] memory _aggregationIds,
        bytes32[] memory _proofHashes
    ) external onlyOwner nonReentrant {
        require(
            _players.length == _blocksDestroyed.length,
            "Array length mismatch"
        );
        require(
            _players.length == _aggregationIds.length,
            "Array length mismatch"
        );
        require(
            _players.length == _proofHashes.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < _players.length; i++) {
            if (
                _players[i] != address(0) &&
                _blocksDestroyed[i] > 0 &&
                !usedProofs[_proofHashes[i]]
            ) {
                usedProofs[_proofHashes[i]] = true;
                uint256 reward = calculateReward(_blocksDestroyed[i]);

                totalAirdropsReceived[_players[i]] += reward;
                lastAirdropTime[_players[i]] = block.timestamp;

                _mint(_players[i], reward);

                emit TokensAirdropped(
                    _players[i],
                    _blocksDestroyed[i],
                    reward,
                    _aggregationIds[i]
                );
            }
        }
    }

    /**
     * @dev Calculate reward based on blocks destroyed
     */
    function calculateReward(
        uint256 _blocksDestroyed
    ) public view returns (uint256) {
        for (uint256 i = 0; i < rewardTiers.length; i++) {
            if (
                _blocksDestroyed >= rewardTiers[i].minBlocks &&
                _blocksDestroyed <= rewardTiers[i].maxBlocks
            ) {
                return rewardTiers[i].tokenReward;
            }
        }
        return rewardTiers[0].tokenReward; // Default to lowest tier
    }

    /**
     * @dev Emergency mint function
     */
    function emergencyMint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    /**
     * @dev Update zkVerify contract address
     */
    function updateZkVerify(address _newZkVerify) external onlyOwner {
        zkVerify = _newZkVerify;
    }

    /**
     * @dev Update vkey (image ID)
     */
    function updateVkey(bytes32 _newVkey) external onlyOwner {
        vkey = _newVkey;
    }

    /**
     * @dev Add or update reward tier
     */
    function setRewardTier(
        uint256 _tierIndex,
        uint256 _minBlocks,
        uint256 _maxBlocks,
        uint256 _tokenReward
    ) external onlyOwner {
        if (_tierIndex >= rewardTiers.length) {
            rewardTiers.push(RewardTier(_minBlocks, _maxBlocks, _tokenReward));
        } else {
            rewardTiers[_tierIndex] = RewardTier(
                _minBlocks,
                _maxBlocks,
                _tokenReward
            );
        }

        emit RewardTierUpdated(
            _tierIndex,
            _minBlocks,
            _maxBlocks,
            _tokenReward
        );
    }

    /**
     * @dev Get total number of reward tiers
     */
    function getRewardTiersCount() external view returns (uint256) {
        return rewardTiers.length;
    }

    /**
     * @dev Check if a proof has been used
     */
    function isProofUsed(bytes32 _proofHash) external view returns (bool) {
        return usedProofs[_proofHash];
    }

    /**
     * @dev Get player airdrop stats
     */
    function getPlayerStats(
        address _player
    ) external view returns (uint256 totalReceived, uint256 lastAirdrop) {
        return (totalAirdropsReceived[_player], lastAirdropTime[_player]);
    }

    /**
     * @dev Withdraw any ETH sent to contract (for gas refunds)
     */
    function withdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Allow contract to receive ETH for gas sponsorship
     */
    receive() external payable {}
}
