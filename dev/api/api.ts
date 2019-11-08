import { Blockchain } from "../blockchain";
import express = require('express');

const app =  express();

const blockchain = new Blockchain();
app.get('/blockchain', function (req, res) {
    res.send(blockchain)
});

app.listen(3000, function() {
    console.log('listening on port 3000');
});