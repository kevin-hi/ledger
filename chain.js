"use strict";

const GLOBAL = require('./constants/global');
const Block = require('./block');
const {calculateHash} = require('./hash');

class Chain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, 0, new Date(), GLOBAL.GENESIS_BLOCK_DESCRIPTION);
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousBlock = this.getLastBlock().hash;
        newBlock.hash = calculateHash(newBlock);
        this.chain.push(newBlock);
    }
}

module.exports = Chain;

