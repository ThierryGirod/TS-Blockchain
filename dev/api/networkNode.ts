import { Blockchain } from "../blockchain";
import express = require('express');
import bodyParser = require('body-parser');
import uuid = require('uuid');
import rp = require('request-promise');
import { Block } from "../block";

const app = express();
const nodeAddress = uuid().split('-').join('');
const girodcoin = new Blockchain();
const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


/** Blockchain Access API Endpoints */
app.get('/', function (req, res) {
    const currentNodeUrl = girodcoin.getCurrentNodeUrl();
    res.json({
        note: `Hallo ${currentNodeUrl}`
    });
});

app.get('/blockchain', function (req, res) {
    res.send(girodcoin);
});

app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex = girodcoin.addNewPendingTransaction(newTransaction);
    res.json({
        note: `Transaction will be added in block ${blockIndex}.`
    });
});

app.post('/transaction/broadcast', function (req, res) {
    const newTransaction = girodcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    girodcoin.addNewPendingTransaction(newTransaction);

    const requestPromises = [];
    girodcoin.getNetworkNodeUrls().forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        }

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            res.json({ note: 'Transaction created and broadcast successfully.' });
        });
});

app.get('/mine', function (req, res) {

    const lastBlock = girodcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const nonce = girodcoin.proofOfWork(previousBlockHash, girodcoin.getPendingTransactions()); //eventually create a separate currentBlockData object withs transactions and index like in the book
    const blockHash = girodcoin.hashBlock(previousBlockHash, girodcoin.getPendingTransactions(), nonce);
    const newBlock = girodcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises = [];
    girodcoin.getNetworkNodeUrls().forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: {
                newBlock: newBlock
            },
            json: true
        }

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            const requestOptions = {
                uri: girodcoin.getCurrentNodeUrl() + '/transaction/broadcast',
                method: 'POST',
                body: {
                    "amount": 12.5,
                    "sender": "reward",
                    "recipient": nodeAddress
                },
                json: true
            }

            return rp(requestOptions);
        })
        .then(data => {
            res.json({
                note: "New block mined successfully!",
                block: newBlock
            });
        });
});

app.post('/receive-new-block', function (req, res) {
    const newBlock: Block = req.body.newBlock;
    const lastBlock = girodcoin.getLastBlock();

    if (lastBlock.hash === newBlock.previousBlockHash &&
        lastBlock.index + 1 === newBlock.index) {
            girodcoin.addBlockToChain(newBlock);
            girodcoin.deletePendingTransactions();
            res.json({
                note: 'New block received and accepted.',
                newBlock: newBlock
            });
    } else {
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        });
    }
});

/** Networking API Endpoints*/
app.post('/register-and-broadcast-node', function (req, res) {
    /** register */
    const newNodeUrl = req.body.newNodeUrl;
    girodcoin.addNewNetworkNode(newNodeUrl);

    /** broadcast */
    const regNodePromises = [];
    girodcoin.getNetworkNodeUrls().forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {
                newNodeUrl: newNodeUrl
            },
            json: true
        }

        regNodePromises.push(rp(requestOptions));
    });

    Promise.all(regNodePromises).then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: {
                allNetworkNodes: [
                    ...girodcoin.getNetworkNodeUrls(),
                    girodcoin.getCurrentNodeUrl()
                ]
            },
            json: true
        }
        return rp(bulkRegisterOptions);
    })
        .then(data => {
            res.json({ note: 'New node registered with network successfully.' });
        });
});

app.post('/register-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    girodcoin.addNewNetworkNode(newNodeUrl);
    res.json({
        note: "New node registered successuflly!",
    });
});

app.post('/register-nodes-bulk', function (req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        girodcoin.addNewNetworkNode(networkNodeUrl);
    });
    res.json({
        note: 'Bulk registration successfull.'
    });
});

/** Start App */
app.listen(port, function () {
    console.log(`listening on port ${port}`);
});