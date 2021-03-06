import { Transaction } from "./transaction";
import { Block } from "./block";
import * as sha256 from "sha256"
import uuid = require('uuid');;

export class Blockchain {

    private chain: Block[];
    private newTransactions: Transaction[];
    private currentNodeUrl: string;
    private networkNodes: string[];

    constructor() {
        this.chain = [];
        this.newTransactions = [];
        this.currentNodeUrl = process.argv[3];
        this.networkNodes = [];
        this.createGenesisBlock();
    }

    private createGenesisBlock() {
        let previousHash = '0';
        let nonce = 0;
        let hash = '0';
        this.createNewBlock(nonce, previousHash, hash);
    }

    createNewBlock(nonce: number,
        previousBlockHash: string,
        hash: string): Block {

        const newBlock: Block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.newTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        }

        this.emptyNewTransactions();
        this.addBlockToChain(newBlock)

        return newBlock;
    }

    getLastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction(amount: number, sender: string, recipient: string): Transaction {
        const transactionId: string = uuid().split('-').join('');
        const newTransaction: Transaction = {
            amount: amount,
            sender: sender,
            recipient: recipient,
            transactionId: transactionId
        }

        return newTransaction;
    }

    addNewPendingTransaction(transaction: Transaction): number {
        this.addNewTransaction(transaction);

        return this.getLastBlock().index + 1;
    }

    getPendingTransactions(): Transaction[] {
        return this.newTransactions;
    }

    private addNewTransaction(transaction: Transaction): void {
        this.newTransactions.push(transaction);
    }

    deletePendingTransactions(): void {
        this.newTransactions = [];
    }

    setPendingTransactions(transactions: Transaction[]): void {
        this.newTransactions = transactions;
    }

    addBlockToChain(block: Block): void {
        this.chain.push(block);
    }

    private emptyNewTransactions(): void {
        this.newTransactions = [];
    }

    getChain(): Block[] {
        return this.chain;
    }

    setChain(chain: Block[]): void {
        this.chain = chain;
    }

    hashBlock(previousBlockHash: string, currentBlockData: Transaction[], nonce: number): string {
        const dataAsString: string = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    }

    proofOfWork(previousBlockHash: string, currentBlockData: Transaction[]): number {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        while (hash.substr(0, 4) !== '0000') {
            nonce = nonce + 1;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        }
        return nonce;
    }

    getCurrentNodeUrl(): string {
        return this.currentNodeUrl;
    }

    getNetworkNodeUrls(): string[] {
        return this.networkNodes;
    }

    addNewNetworkNode(url: string) {
        if (this.networkNodes.indexOf(url) == -1
            && (this.getCurrentNodeUrl().localeCompare(url) !== 0)) {
            this.networkNodes.push(url);

        }

    }

    chainIsValid(blockchain: Block[]): boolean {
        for (let i = 1; i < blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const previousBlock = blockchain[i - 1];
            const blockHash = this.hashBlock(previousBlock.hash, currentBlock.transactions, currentBlock.nonce);

            if (currentBlock.previousBlockHash !== previousBlock.hash) {
                return false;
            }

            if (blockHash.substring(0, 4) !== '0000') {
                return false;
            }

        }

        const genesisBlock = blockchain[0];
        if (genesisBlock.nonce !== 0) {
            return false;
        }

        if (genesisBlock.previousBlockHash !== '0') {
            return false;
        }

        if (genesisBlock.hash !== '0') {
            return false;
        }

        if(genesisBlock.transactions.length !== 0) {
            return false;
        }
        
        return true;
    }

}