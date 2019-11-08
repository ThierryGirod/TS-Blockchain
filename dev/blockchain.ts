import { Transaction } from "./transaction";
import { Block } from "./block";
import * as sha256 from "sha256";

export class Blockchain {

    private chain: Block[];
    private newTransactions: Transaction[];

    constructor() {
        this.chain = [];
        this.newTransactions = [];
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

    createNewTransaction(amount: number, sender: string, recipient: string): void {
        const newTransaction: Transaction = {
            amount: amount,
            sender: sender,
            recipient: recipient
        }

        this.addNewTransaction(newTransaction);
    }

    private addNewTransaction(transaction: Transaction): void {
        this.newTransactions.push(transaction);
    }

    private addBlockToChain(block: Block): void {
        this.chain.push(block);
    }

    private emptyNewTransactions(): void {
        this.newTransactions = [];
    }

    getChain(): Block[] {
        return this.chain;
    }

    hashBlock(previousBlockHash: string, currentBlockData: Transaction[], nonce: number) {
        const dataAsString: string = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    }

}