class Block {

    constructor(index, hash, previousHash, timestamp, data, difficulty) {
        this.index = 1;
        this.hash = hash.toString();
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
    }

}
