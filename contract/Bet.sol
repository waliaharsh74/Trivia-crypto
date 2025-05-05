// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
contract CryptoTriviaBet {
    uint16 public constant FEE_BPS = 300;
    address public immutable feeRecipient;
    address public immutable scoreOracle;

    constructor(address _feeRecipient, address _scoreOracle) {
        require(_feeRecipient != address(0), "feeRecipient 0");
        require(_scoreOracle != address(0), "scoreOracle 0");
        feeRecipient = _feeRecipient;
        scoreOracle = _scoreOracle;
    }

    struct Bet {
        string topic;
        uint256 amount;
        address creator;
        address joiner;
        bool creatorCompleted;
        bool joinerCompleted;
        uint8 creatorScore;
        uint8 joinerScore;
        address winner;
    }

    mapping(bytes32 slugHash => Bet) private bets;

    event BetCreated(
        string slug,
        address indexed creator,
        uint256 amount,
        string topic
    );
    event BetJoined(string slug, address indexed joiner);
    event ScoreSubmitted(string slug, address indexed player, uint8 score);
    event BetResolved(string slug, address indexed winner, uint256 payout);

    bytes32 private constant SCORE_TYPEHASH =
        keccak256("Score(bytes32 slugHash,address player,uint8 score)");

    function _slugHash(string memory slug) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(slug));
    }

    modifier betExists(string memory slug) {
        require(bets[_slugHash(slug)].creator != address(0), "Bet: not found");
        _;
    }

    function createBet(
        string calldata slug,
        string calldata topic
    ) external payable {
        bytes32 h = _slugHash(slug);
        require(bets[h].creator == address(0), "Bet: slug taken");
        require(msg.value > 0, "Bet: amount must be >0");

        bets[h] = Bet({
            topic: topic,
            amount: msg.value,
            creator: msg.sender,
            joiner: address(0),
            creatorCompleted: false,
            joinerCompleted: false,
            creatorScore: 0,
            joinerScore: 0,
            winner: address(0)
        });

        emit BetCreated(slug, msg.sender, msg.value, topic);
    }

    function joinBet(string calldata slug) external payable betExists(slug) {
        Bet storage b = bets[_slugHash(slug)];
        require(b.joiner == address(0), "Bet: already joined");
        require(msg.value == b.amount, "Bet: incorrect stake");
        require(msg.sender != b.creator, "Bet: creator cannot join");

        b.joiner = msg.sender;

        emit BetJoined(slug, msg.sender);
    }

    
    function submitScoreSigned(
        string calldata slug,
        uint8 score,
        bytes calldata sig
    ) external betExists(slug) {
        Bet storage b = bets[_slugHash(slug)];

        require(
            msg.sender == b.creator || msg.sender == b.joiner,
            "Bet: not a participant"
        );
        require(score <= 15, "Bet: max 15 questions");


        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                SCORE_TYPEHASH,
                keccak256(abi.encode(_slugHash(slug), msg.sender, score))
            )
        );


        require(
            ECDSA.recover(digest, sig) == scoreOracle,
            "Bet: bad oracle sig"
        );

       
        if (msg.sender == b.creator) {
            require(!b.creatorCompleted, "creator already scored");
            b.creatorScore = score;
            b.creatorCompleted = true;
        } else {
            require(!b.joinerCompleted, "joiner already scored");
            b.joinerScore = score;
            b.joinerCompleted = true;
        }

        emit ScoreSubmitted(slug, msg.sender, score);
    }

    function resolve(string calldata slug) external betExists(slug) {
        Bet storage b = bets[_slugHash(slug)];
        require(
            b.creatorCompleted && b.joinerCompleted,
            "Bet: quizzes not done"
        );
        require(b.winner == address(0), "Bet: already resolved");

        if (b.creatorScore >= b.joinerScore) {
            b.winner = b.creator;
        } else {
            b.winner = b.joiner;
        }

        uint256 pot = b.amount * 2;
        uint256 fee = (pot * FEE_BPS) / 10_000;
        uint256 payout = pot - fee;

        (bool ok1, ) = feeRecipient.call{value: fee}("");
        (bool ok2, ) = b.winner.call{value: payout}("");
        require(ok1 && ok2, "Bet: transfer failed");

        emit BetResolved(slug, b.winner, payout);
    }

    function getBet(
        string calldata slug
    ) external view betExists(slug) returns (Bet memory) {
        return bets[_slugHash(slug)];
    }
}
