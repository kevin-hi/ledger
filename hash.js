"use strict";

const SHA256 = require('crypto-js/sha256');

exports.calculateHash = block => SHA256(`${block.index}${block.previousBlock}${block.timestamp}`).toString();

