import { Blockchain } from "../blockchain";
import express = require('express');
import bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))

const bitcoin = new Blockchain();


/**API Endpoints */
app.get('/blockchain', function(req, res) {
    res.send(bitcoin)
});

app.post('/transaction', function(req, res){
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({
        note:`Transaction will be added in block ${blockIndex}.`
    });
});

app.listen(3000, function() {
    console.log('listening on port 3000');
});