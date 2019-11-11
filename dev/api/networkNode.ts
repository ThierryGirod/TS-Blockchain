import { Blockchain } from "../blockchain";
import express = require('express');
import bodyParser = require('body-parser');
import uuid = require('uuid');
import rp = require('request-promise');

const app = express();
const nodeAddress = uuid().split('-').join('');
const girodcoin = new Blockchain();
const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


/** Blockchain Access API Endpoints */
app.get('/', function(req, res) {
    const currentNodeUrl = girodcoin.getCurrentNodeUrl();
    res.json({
        note: `Hallo ${currentNodeUrl}`
    });
});

app.get('/blockchain', function(req, res) {
    res.send(girodcoin);
});

app.post('/transaction', function(req, res) {
    const blockIndex = girodcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({
        note: `Transaction will be added in block ${blockIndex}.`
    });
});

app.get('/mine', function(req, res) {

    const lastBlock = girodcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const nonce = girodcoin.proofOfWork(previousBlockHash, girodcoin.getPendingTransactions()); //eventually create a separate currentBlockData object withs transactions and index like in the book
    const blockHash = girodcoin.hashBlock(previousBlockHash, girodcoin.getPendingTransactions(), nonce);
    const newBlock = girodcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    res.json({
        note: "New block mined successuflly!",
        block: newBlock
    });

    girodcoin.createNewTransaction(12.5, 'reward', nodeAddress)
});

/** Networking API Endpoints*/
app.post('register-and-broadcast-node', function(req, res) {
    /** register */
    const newNodeUrl = req.body.newNodeUrl;
    girodcoin.addNewNetworkNode(newNodeUrl);

    /** broadcast */
    girodcoin.getNetworkNodeUrls().forEach(networkNodeUrl => {
        const requestOptions = {
            uri: newNodeUrl + '/register-node',
            method: 'POST',
            body: {
                newNodeUrl: networkNodeUrl
            },
            json: true
        }

        rp(requestOptions);
    });
});

app.listen(port, function() {
    console.log(`listening on port ${port}`);
});