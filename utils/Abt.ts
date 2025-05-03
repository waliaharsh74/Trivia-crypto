export const wagmiAbi =[
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_feeRecipient",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "slug",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "topic",
                "type": "string"
            }
        ],
        "name": "BetCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "slug",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "joiner",
                "type": "address"
            }
        ],
        "name": "BetJoined",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "slug",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "payout",
                "type": "uint256"
            }
        ],
        "name": "BetResolved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "slug",
                "type": "string"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "score",
                "type": "uint8"
            }
        ],
        "name": "ScoreSubmitted",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "FEE_BPS",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "slug",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "topic",
                "type": "string"
            }
        ],
        "name": "createBet",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeRecipient",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "slug",
                "type": "string"
            }
        ],
        "name": "getBet",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "topic",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "creator",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "joiner",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "creatorCompleted",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "joinerCompleted",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint8",
                        "name": "creatorScore",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "joinerScore",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "winner",
                        "type": "address"
                    }
                ],
                "internalType": "struct CryptoTriviaBet.Bet",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "slug",
                "type": "string"
            }
        ],
        "name": "joinBet",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "slug",
                "type": "string"
            }
        ],
        "name": "resolve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "slug",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "score",
                "type": "uint8"
            }
        ],
        "name": "submitScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]