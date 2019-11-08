import { Transaction } from "./transaction";
import { Block } from "./block";

export class Blockchain {

    private chain: Block[];
    private newTransactions: Transaction[];

    constructor() {
        this.chain = [];
        this.newTransactions = [];
    }
}