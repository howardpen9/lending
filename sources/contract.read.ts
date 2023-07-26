import { Cell, beginCell, Address, ContractProvider, TonClient4, fromNano, Slice, contractAddress } from "ton";
import { printSeparator } from "./utils/print";
import { lending_record } from "./output/sample_lending_record";

(async () => {
    const client = new TonClient4({ endpoint: "https://sandbox-v4.tonhubapi.com" });
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    let owner = Address.parse("kQAV6bPBdrulUJxY9jADD1yqhmb29W6hLJCmELllZKiSCjKA");
    let init = await lending_record.init(owner);
    let contract_address = contractAddress(0, init);
    // ==============================================================================================================================
    console.log("=========================================");
    console.log("Loading contract data...");
    console.log("🙆 Calling Collection Address:: \n" + contract_address + "\n");
    let contract_dataFormat = lending_record.fromAddress(contract_address);
    let contract = client.open(contract_dataFormat);
    // ================================= 印出整個升級條件 =================================
    console.log("🆙 Record Printing...");
    let record = await contract.getGetRecord();
    if (record.size > 0) {
        const keys = record.keys();
        const value = record.values();
        for (let i = 0; i < keys.length; i++) {
            console.log("💎 NFT Item[" + keys[i].toString() + "]: \n==>🔥Depositor: " + value[i].toString()); // print the address as a string
        }
    }
    printSeparator();
})();
