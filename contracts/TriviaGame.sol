// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TriviaGame {
    struct Game {
        address player1;
        address player2;
        uint256 betAmount;
        address tokenAddress; // Address of the ERC20 token being used (address(0) for ETH)
        uint8 player1Score;
        uint8 player2Score;
        GameStatus status;
        uint256 createdAt;
    }
    
    enum GameStatus {
        WAITING,
        IN_PROGRESS,
        COMPLETED
    }
    
    // Platform fee percentage (3% per player, 6% total)
    uint256 public constant PLATFORM_FEE = 300; // 3.00%
    uint256 public constant FEE_DENOMINATOR = 10000; // 100.00%
    
    // Game storage
    mapping(bytes32 => Game) public games;
    
    // Events
    event GameCreated(bytes32 indexed gameId, address indexed player1, uint256 betAmount, address tokenAddress);
    event GameJoined(bytes32 indexed gameId, address indexed player2);
    event GameCompleted(bytes32 indexed gameId, address indexed winner, uint256 winnings);
    
    // Create a new game
    function createGame(address tokenAddress) external payable returns (bytes32) {
        require(msg.value > 0, "Bet amount must be greater than 0");
        
        // Generate a unique game ID
        bytes32 gameId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.prevrandao));
        
        // Create the game
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            betAmount: msg.value,
            tokenAddress: tokenAddress,
            player1Score: 0,
            player2Score: 0,
            status: GameStatus.WAITING,
            createdAt: block.timestamp
        });
        
        emit GameCreated(gameId, msg.sender, msg.value, tokenAddress);
        
        return gameId;
    }
    
    // Join an existing game
    function joinGame(bytes32 gameId) external payable {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.status == GameStatus.WAITING, "Game is not in waiting status");
        require(game.player2 == address(0), "Game already has two players");
        require(msg.sender != game.player1, "Cannot join your own game");
        require(msg.value == game.betAmount, "Bet amount does not match");
        
        // Join the game
        game.player2 = msg.sender;
        game.status = GameStatus.IN_PROGRESS;
        
        emit GameJoined(gameId, msg.sender);
    }
    
    // Complete a game and distribute rewards
    function completeGame(bytes32 gameId, uint8 player1Score, uint8 player2Score) external {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.status == GameStatus.IN_PROGRESS, "Game is not in progress");
        require(msg.sender == game.player1 || msg.sender == game.player2, "Only players can complete the game");
        
        // Update scores
        game.player1Score = player1Score;
        game.player2Score = player2Score;
        game.status = GameStatus.COMPLETED;
        
        // Calculate total bet amount
        uint256 totalBet = game.betAmount * 2;
        
        // Determine the winner and distribute rewards
        if (player1Score > player2Score) {
            // Player 1 wins
            uint256 platformFee = (totalBet * PLATFORM_FEE) / FEE_DENOMINATOR;
            uint256 winnings = totalBet - platformFee;
            
            payable(game.player1).transfer(winnings);
            emit GameCompleted(gameId, game.player1, winnings);
        } else if (player2Score > player1Score) {
            // Player 2 wins
            uint256 platformFee = (totalBet * PLATFORM_FEE) / FEE_DENOMINATOR;
            uint256 winnings = totalBet - platformFee;
            
            payable(game.player2).transfer(winnings);
            emit GameCompleted(gameId, game.player2, winnings);
        } else {
            // It's a tie, return bets to both players
            payable(game.player1).transfer(game.betAmount);
            payable(game.player2).transfer(game.betAmount);
            emit GameCompleted(gameId, address(0), 0);
        }
    }
    
    // Cancel a game that hasn't been joined yet
    function cancelGame(bytes32 gameId) external {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.status == GameStatus.WAITING, "Game is not in waiting status");
        require(msg.sender == game.player1, "Only the creator can cancel the game");
        
        // Return the bet to player 1
        payable(game.player1).transfer(game.betAmount);
        
        // Delete the game
        delete games[gameId];
    }
    
    // Automatically cancel games that haven't been joined after 24 hours
    function cancelStaleGame(bytes32 gameId) external {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.status == GameStatus.WAITING, "Game is not in waiting status");
        require(block.timestamp >= game.createdAt + 24 hours, "Game is not stale yet");
        
        // Return the bet to player 1
        payable(game.player1).transfer(game.betAmount);
        
        // Delete the game
        delete games[gameId];
    }
}
