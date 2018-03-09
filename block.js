"use strict";

class Block {
    constructor(hash, previousBlock, timestamp, transaction) {
        this.hash = hash.toString();
        this.previousBlock = previousBlock.toString();
        this.timestamp = timestamp;
        this.transaction = transaction;
    }
}

module.exports = Block;
