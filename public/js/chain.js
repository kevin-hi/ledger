class Chain {

    constructor(data) {
        this.chain = data ? [...data] : [this.createGenesisBlock()];
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    createGenesisBlock() {
        return new Block(0, 0, 0, new Date(), 'GENESIS BLOCK', 0, 0);
    }

    createNewBlock(newBlock) {
        const lastBlock = this.getLastBlock();
        newBlock.index = lastBlock.index + 1;
        newBlock.previousHash = lastBlock.hash;
        newBlock.timestamp = new Date();
        newBlock.difficulty = Number(lastBlock.index / 50);
        newBlock.hash = Module.calculateHash(newBlock);
        return newBlock;
    }

    addBlock(block) {
        this.chain.push(block);
    }
}
