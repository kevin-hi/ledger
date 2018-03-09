"use strict";

const Chain = require('./chain');

function start() {
    const mainChain = new Chain();
    for (let i = 0; i < 5; i++) {
        mainChain.addBlock({
            transaction: 'new block' + i,
            timestamp: new Date()
        });
    }

    console.log(mainChain);
}

start();
