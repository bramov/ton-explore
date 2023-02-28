import { KeyPair, mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4 } from "ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

type Credentials = {
    key: KeyPair,
    wallet: WalletContractV4,
    client: TonClient
}

export async function authenticate(): Promise<Credentials> {
    require('dotenv').config();
    const mnemonic = process.env.MNEMONIC || '';

    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    return { key, wallet, client };
}