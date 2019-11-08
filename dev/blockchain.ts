import { Transaction } from "./transaction";
import { Block } from "./block";

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

    private addBlockToChain(block: Block): void {
        this.chain.push(block);
    }

    private emptyNewTransactions(): void {
        this.newTransactions = [];
    }

}