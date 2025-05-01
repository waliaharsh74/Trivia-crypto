// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.26 <=0.9.0;
contract Bet {
    uint public constant PLATFORM_FEE_PCT = 3;
    uint public constant JOIN_TIMEOUT = 15 days;
    struct QuizBet {
    address creator;
    address joiner;
    address winner;
    uint    amount;
    uint    createdAt;
    bool    betResolved;
    string  slug;
    bool    joinerCompleted;
    bool    creatorCompleted;
    uint    creatorScore;
    uint    joinerScore;
  }
    constructor(){

    }
}