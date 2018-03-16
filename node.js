"use strict";

const APPLICATION = require('./constants/application');
const express = require('express');
const bodyParser = require('body-parser');
const webSocket = require('ws');
const CONTENT = require('./constants/content');
const actions = require('./actions');
const sockets = new Map();

let mainChain = [
    {
        index: 0,
        hash: 0,
        previousHash: 0,
        timestamp: new Date(),
        data: CONTENT.GENESIS_BLOCK_DESCRIPTION,
        difficulty: 0
    }
];

const startWeb = () => {
    const server = express();
    server.use(bodyParser.json());
    server.set('port', APPLICATION.CONTROL_PORT);
    server.set('views', __dirname + '/views');
    server.engine('html', require('ejs').renderFile);
    server.use(express.static(require('path').join(__dirname, 'public')));

    server.get('/blocks', (req, res) => res.send(JSON.stringify(mainChain)));
    server.get('/peers', (req, res) => res.send(Array.from(sockets).map(item => item[0])));
    server.get('/', (req, res) => res.render('index.ejs'));

    server.listen(server.get('port'), () => console.log(`Web Server is listening on: ${server.settings.port}`));
};

const startP2PServer = () => {
    const server = new webSocket.Server({port: APPLICATION.P2P_PORT});
    server.on('connection', ws => initConnection(ws));
    console.log(`WebSocket P2P is listening on: ${APPLICATION.P2P_PORT}`);
};

const initConnection = ws => {
    const id = `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
    console.log('%s opening', id);

    ws.on('close', () => {
        console.log('%s closing', id);
        sockets.delete(id);
        broadcast(actions.nodes(Array.from(sockets).map(item => item[0])));
    });

    ws.on('error', () => {
        console.log('connection failed')
    });

    sockets.set(id, ws);
    broadcast(actions.nodes(Array.from(sockets).map(item => item[0])));
    broadcast(actions.chain(mainChain));

    initMessageHandler(ws);
};

const initMessageHandler = ws => {
    ws.on('message', data => {
        const message = JSON.parse(data);
        switch (message.type) {
            case 'USER_AGENT':
                console.log('New User Agent %s', message.value);
                break;
            case 'CHAIN':
                const messageChain = message.value.chain;
                const newChain = messageChain.length > mainChain.length ? messageChain : null;

                if (newChain) {
                    mainChain = newChain;
                    broadcast(actions.chain(mainChain));
                }

                break;
            default:
                console.log('no handling here');
        }
    });
};

const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = message => sockets.forEach(socket => write(socket, message));

startWeb();
startP2PServer();





