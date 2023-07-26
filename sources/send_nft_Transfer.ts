import { TonClient4, WalletContractV4, internal, beginCell, toNano, contractAddress, Address, fromNano } from "ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { lending_record, storeTransfer } from "./output/sample_lending_record";
import * as dotenv from "dotenv";
dotenv.config();

// ==============================================================================================================================

async function main() {
    // // 🟡  Test-net: create client for testnet sandboxv4 API - alternative endpoint
    const client = new TonClient4({ endpoint: "https://sandbox-v4.tonhubapi.com" });
    let mnemonics = (process.env.eqd1_test_net || "").toString();

    // Create wallet contract
    let keyPair = await mnemonicToPrivateKey([mnemonics]);
    let workchain = 0; // Usually you need a workchain 0
    let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let wallet_address = client.open(wallet);
    console.log("Wallet Address: \n" + wallet_address.address);

    let balance: bigint = await wallet_address.getBalance(); // Get balance
    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");

    // ==============================================================================================================================
    let owner = Address.parse("kQAV6bPBdrulUJxY9jADD1yqhmb29W6hLJCmELllZKiSCjKA");
    let init = await lending_record.init(owner);
    let address = contractAddress(0, init);
    let original_holder = Address.parse("EQD1ptyvitBi3JbHaDQt_6j-15ABn9BqdABTFA1vgzs3Ae6z"); // 🔴🔴🔴  原本NFT持有者
    // ==============================================================================================================================
    let nft_item_address = Address.parse("EQAquUsAxajHolPqa4ew5aC4LYBehaouFQiC6Pc5waCVg9Hv"); // 🔴 需要取這個要轉移的NFT地址、從錢包所持有的NFT去找
    let msg_transfer_body = beginCell()
        .storeBuffer(Buffer.from("5fcc3d14", "hex"))
        .storeUint(0n, 64) // query_id
        .storeAddress(address) // new_owner
        .storeAddress(original_holder) // response_destination
        .storeUint(0, 1) // custom_payload
        .storeCoins(toNano("0.09")) // forward_amount
        .endCell();
    // ==============================================================================================================================
    let seqno: number = await wallet_address.getSeqno();
    let transfer = await wallet_address.sendTransfer({
        seqno: seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: nft_item_address,
                value: toNano("0.2"),
                body: msg_transfer_body,
            }),
        ],
    });
    console.log("==== Txs Sent ===");
}

main();
