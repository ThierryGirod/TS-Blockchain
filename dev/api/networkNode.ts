import { Blockchain } from "../blockchain";
import express = require('express');
import bodyParser = require('body-parser');
import uuid = require('uuid');

const app = express();
const nodeAddress = uuid().split('-').join('');
const bitcoin = new Blockchain();
const port = process.argv[2];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


/**API Endpoints */
app.get('/', function(req, res) {
    res.json({
        note: "Hallo Blockchain"
    });
});

app.get('/blockchain', function(req, res) {
    res.send(bitcoin);
});

app.post('/transaction', function(req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({
        note: `Transaction will be added in block ${blockIndex}.`
    });
});

app.get('/mine', function(req, res) {

    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const nonce = bitcoin.proofOfWork(previousBlockHash, bitcoin.getPendingTransactions()); //eventually create a separate currentBlockData object withs transactions and index like in the book
    const blockHash = bitcoin.hashBlock(previousBlockHash, bitcoin.getPendingTransactions(), nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    res.json({
        note: "New block mined successuflly!",
        block: newBlock
    });

    bitcoin.createNewTransaction(12.5,'reward',nodeAddress)
});

app.listen(port, function() {
    console.log(`listening on port ${port}`);
});