import { TonClient4, WalletContractV4, internal, beginCell, toNano, contractAddress, Address, fromNano } from "ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { lending_record, storeTransfer, storeAdmin_Withdraw } from "./output/sample_lending_record";
import * as dotenv from "dotenv";
dotenv.config();

// ==============================================================================================================================

async function main() {
    // // 🟡  Test-net: create client for testnet sandboxv4 API - alternative endpoint
    const client = new TonClient4({ endpoint: "https://sandbox-v4.tonhubapi.com" });
    let mnemonics = (process.env.kqav_te_test_net || "").toString();

    // Create wallet contract
    let keyPair = await mnemonicToPrivateKey([mnemonics]);
    let workchain = 0; // Usually you need a workchain 0
    let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let wallet_address = client.open(wallet);
    console.log("Wallet Address: \n" + wallet_address.address);

    // Get Balance
    let balance: bigint = await wallet_address.getBalance(); // Get balance
    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");

    // ==============================================================================================================================
    let owner = Address.parse("kQAV6bPBdrulUJxY9jADD1yqhmb29W6hLJCmELllZKiSCjKA");
    let init = await lending_record.init(owner);
    let address = contractAddress(0, init);
    // ==============================================================================================================================
    let nft_item_address = Address.parse("EQAquUsAxajHolPqa4ew5aC4LYBehaouFQiC6Pc5waCVg9Hv"); // 🔴
    // Need to modify when you try to transfer the nft, need to get the address from the wallet
    // 需要取這個要轉移的NFT地址、從錢包所持有的NFT去找

    let packed = beginCell()
        .store(
            storeTransfer({
                $$type: "Transfer",
                query_id: 0n,
                new_owner: address, // 都是回傳給 「紀錄合約」的話
                response_destination: owner,
                custom_payload: null,
                forward_amount: toNano("0.15"),
                forward_payload: beginCell().endCell(),
            })
        )
        .endCell();
    // ==============================================================================================================================
    // storeAdmin_Withdraw -> 發給 Record Contract Address
    // let packed_2 = beginCell()
    //     .store(
    //         storeAdmin_Withdraw({
    //             $$type: "Admin_Withdraw",
    //             nft_item_address: nft_item_address,
    //         })
    //     )
    //     .endCell();
    // ==============================================================================================================================
    let seqno: number = await wallet_address.getSeqno();
    let transfer = await wallet_address.sendTransfer({
        seqno: seqno,
        secretKey: keyPair.secretKey,
        messages: [
            internal({
                to: nft_item_address,
                // to: address,
                value: toNano("0.2"),
                body: packed,
            }),
        ],
    });
    console.log("==== Txs Sent ===");
}

main();
