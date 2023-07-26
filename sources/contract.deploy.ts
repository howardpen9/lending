import { beginCell, contractAddress, toNano, Cell, Address } from "ton";
import { testAddress } from "ton-emulator";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { lending_record } from "./output/sample_lending_record";
// ================================================================= //
(async () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    let owner = Address.parse("kQAV6bPBdrulUJxY9jADD1yqhmb29W6hLJCmELllZKiSCjKA");
    let init = await lending_record.init(owner);
    let address = contractAddress(0, init);
    let deployAmount = toNano("0.1");
    let testnet = true;

    // let msg_transfer_body = beginCell()
    //     .storeBuffer(Buffer.from("5fcc3d14", "hex")) // Transfer
    //     .storeUint(0n, 64) // query_id
    //     .storeAddress(address) // new_owner
    //     .storeAddress(owner) // response_destination
    //     .storeUint(0, 1) // custom_payload
    //     .storeCoins(toNano("0.09")) // forward_amount
    //     .endCell();

    // Do deploy
    await deploy(init, deployAmount, "", testnet);
    printHeader("Lending!");
    printAddress(address);
})();
