"use strict";

module.exports = {
    nodes(addresses) {
        return {
            type: 'NODES',
            addresses
        }
    },
    chain(chain) {
        return {
            type: 'CHAIN',
            chain
        }
    }
};