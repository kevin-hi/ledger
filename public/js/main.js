"use strict";

const Module = {
    DOM: {
        CLIENTS: document.getElementById('clients'),
        TOTAL: document.getElementById('total'),
        LEDGER_LENGTH: document.getElementById('blockHeight'),
        FOUND: document.getElementById('found'),
        FOUND_COUNT: document.getElementById('foundCount'),
        DIFFICULTY: document.getElementById('epoch'),
        HASH_RATE: document.getElementById('hashRate'),
        FOUND_RATE: document.getElementById('foundRate'),
        TOGGLE: document.getElementById('toggle')
    },
    GLOBALS: {
        MAIN_CHAIN: new Chain(),
        CONNECTION: void 0,
        START_TIME: new Date(),
        BLOCKS_FOUND: [],
        BLOCKS_GENERATED: 0,
        BLOCK_LOOP: null
    },
    initWebSocket () {
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        const location = window.location;
        const wsUri = location.protocol === 'https:' ? 'wss:' : 'ws:' + '//' + location.hostname + ':8000';

        Module.GLOBALS.CONNECTION = new WebSocket(wsUri);
        Module.GLOBALS.CONNECTION.onopen = () => {
            Module.GLOBALS.CONNECTION.send(JSON.stringify({
                type: 'USER_AGENT',
                value: navigator.userAgent
            }));
            //Entry point to automatically start mining
        };

        Module.GLOBALS.CONNECTION.onerror = error => console.log(error);

        Module.initMessageHandler(Module.GLOBALS.CONNECTION);
    },
    initMessageHandler: connection => {
        connection.onmessage = message => {
            let parsedMessage = '';
            try {
                parsedMessage = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }
            Module.handleMessage(parsedMessage);
        };
    },
    handleMessage: parsedMessage => {
        switch(parsedMessage.type) {
            case 'NODES':
                Module.DOM.CLIENTS.innerHTML = Module.generateLiList(parsedMessage.addresses);
                Module.DOM.TOTAL.innerHTML = `Total Connected Clients: ${parsedMessage.addresses.length}`;
                break;
            case 'CHAIN':
                Module.GLOBALS.MAIN_CHAIN = new Chain(parsedMessage.chain);
                Module.DOM.LEDGER_LENGTH.innerHTML = `Block Height: ${parsedMessage.chain.length}`;
                break;
            default:
                console.log('Handling does not exist %s', parsedMessage.type);
        }

    },
    generateLiList: data => data.map(item => `<li>${item}</li>`).join(''),
    toggleMining: () => {
        if (Module.GLOBALS.CONNECTION.readyState === 1) {
            if (Module.GLOBALS.BLOCK_LOOP) {
                clearInterval(Module.GLOBALS.BLOCK_LOOP);
                Module.GLOBALS.BLOCK_LOOP = null;
                Module.DOM.TOGGLE.innerHTML = 'Start';
            } else {
                Module.GLOBALS.BLOCK_LOOP = setInterval(() => Module.createBlock(), 0)
                Module.DOM.TOGGLE.innerHTML = 'Stop';
            }
        } else {
            alert('WebSocket connection yet to be established.');
        }
    },
    createBlock (data = {data: navigator.userAgent}) {
        const newBlock = Module.GLOBALS.MAIN_CHAIN.createNewBlock(data);
        const doesNewBlockMatchDifficulty = Module.hashMatchesDifficulty(newBlock.hash, newBlock.difficulty);
        Module.GLOBALS.BLOCKS_GENERATED += 1;
        document.getElementById('block').innerHTML = newBlock.hash;

        if (doesNewBlockMatchDifficulty) {
            Module.GLOBALS.MAIN_CHAIN.addBlock(newBlock);
            Module.GLOBALS.BLOCKS_FOUND.push(newBlock.hash);
            Module.DOM.FOUND.innerHTML = Module.generateLiList(Module.GLOBALS.BLOCKS_FOUND);
            Module.DOM.FOUND_COUNT.innerHTML = `Blocks found: ${Module.GLOBALS.BLOCKS_FOUND.length || 0}`;
            Module.DOM.DIFFICULTY.innerHTML = `Epoch: ${newBlock.difficulty}`;

            console.log('Valid block found! %s', newBlock.hash);
            Module.GLOBALS.CONNECTION.send(JSON.stringify({
                type: 'CHAIN',
                value: Module.GLOBALS.MAIN_CHAIN
            }))
        }

        const endTime = new Date();
        const sessionDuration = (endTime - Module.GLOBALS.START_TIME)/1000;

        Module.DOM.HASH_RATE.innerHTML = `All Hash Rate (h/s): ${(Module.GLOBALS.BLOCKS_GENERATED/sessionDuration).toFixed(2)}`;
        Module.DOM.FOUND_RATE.innerHTML = `Valid Hash Rate (h/s): ${(Module.GLOBALS.BLOCKS_FOUND.length/sessionDuration).toFixed(2)}`;

    },
    hashMatchesDifficulty (hash, difficulty) {
        const hashInBinary = hexToBinary(hash);
        const requiredPrefix = '0'.repeat(difficulty);
        return hashInBinary.startsWith(requiredPrefix);
    },
    calculateHash: block => CryptoJS.SHA256(`${block.index}${block.previousHash}${block.timestamp.getTime() / 1000}${block.difficulty}${block.data}`).toString(),
    initiate: () => Module.initWebSocket()
};

Module.initiate();



