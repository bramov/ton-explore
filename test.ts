import {TonClient, fromNano, WalletContractV4, internal, SendMode} from "ton";
import { KeyPair } from "ton-crypto";
import { authenticate } from "./authenticate";
import { sleep } from "./utils";

async function main() {
    const { key, wallet, client } = await authenticate();
    await getWalletAddress(wallet);
    await getBalance(wallet, client);
    await transferMoney(key, wallet, client);
}

async function getWalletAddress(wallet: WalletContractV4) {
    // print wallet address
    console.log("address:", wallet.address.toString({ testOnly: true }));

    // print wallet workchain
    console.log("workchain:", wallet.address.workChain);
}

async function getBalance(wallet: WalletContractV4, client: TonClient) {

    // query balance from chain
    const balance = await client.getBalance(wallet.address);
    console.log("balance:", fromNano(balance));

    // query seqno from chain
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("seqno:", seqno);
}

async function transferMoney(key: KeyPair, wallet: WalletContractV4, client: TonClient) {
    // make sure wallet is deployed
    if (!await client.isContractDeployed(wallet.address)) {
        return console.log("wallet is not deployed");
    }

    // send 0.001 TON to EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        messages: [
            internal({
                to: "kQD1n439eWeHzpE93XtzqOObY7FFVxtSNo-Ag3dnvdfHPnQo",
                value: "0.001", // 0.001 TON
                body: "Hello", // optional comment
                bounce: false,
            })
        ]
    });

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}

main();