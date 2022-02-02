import { BN, Provider } from '@project-serum/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
	ClearingHouse,
	ClearingHouseUser,
	initialize,
	DriftEnv,    
	Wallet,
} from '@drift-labs/sdk';
import async from 'async';
require('dotenv').config();
const {TextDecoder, TextEncoder} = require("util");

export const getTokenAddress = (
	mintAddress: string,
	userPubKey: string
): Promise<PublicKey> => {
	return Token.getAssociatedTokenAddress(
		new PublicKey(`ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`),
		TOKEN_PROGRAM_ID,
		new PublicKey(mintAddress),
		new PublicKey(userPubKey)
	);
};
const main = async () => {
	// Initialize Drift SDK
    const sdkConfig = initialize({ env: 'mainnet-beta' as DriftEnv });

	// Set up the Wallet and Provider
	const privateKey = process.env.BOT_PRIVATE_KEY!; // stored as an array string
	const keypair = Keypair.fromSecretKey(
		Uint8Array.from(JSON.parse(privateKey))
	);
    
    
	const wallet = new Wallet(keypair);
    console.log('Wallet initialized');
	// Set up the Connection
	const rpcAddress = process.env.RPC_ADDRESS; // for devnet; https://api.mainnet-beta.solana.com for mainnet;
	const connection = new Connection(rpcAddress!);

	// Set up the Provider
	const provider = new Provider(connection, wallet, Provider.defaultOptions());
    console.log('Provider initialized');
	// Check SOL Balance
	const lamportsBalance = await connection.getBalance(wallet.publicKey);
	console.log('SOL balance:', lamportsBalance / 10 ** 9);

	// Misc. other things to set up
	const usdcTokenAddress = await getTokenAddress(
		sdkConfig.USDC_MINT_ADDRESS,
		wallet.publicKey.toString()
	);    
    console.log('USDC initialized');
	// Set up the Drift Clearing House
	const clearingHousePublicKey = new PublicKey(
		sdkConfig.CLEARING_HOUSE_PROGRAM_ID
	);
	const clearingHouse = ClearingHouse.from(
		connection,
		provider.wallet,
		clearingHousePublicKey
	);
    console.log('Clearing House initialized');
    
	await clearingHouse.subscribe();
    console.log('Subscribed to clearing house');    

    const users: ClearingHouseUser[] = [];
    
    async function initUser(programUserAccount: any) {
        const userAccountPubkey = programUserAccount.publicKey.toString();        
        if (!usersSeen.has(userAccountPubkey)) {                    
            const user = ClearingHouseUser.from(
                clearingHouse,
                programUserAccount.account.authority
            );
            await user.subscribe();
            users.push(user);
            usersSeen.add(userAccountPubkey);
            
            processUser(user);            
        } 
    }

    const usersSeen = new Set<string>();
    
    const updateUserAccounts = async () => {     
        console.log(`Updating users at timestamp ${new Date().toISOString()}`)   
        const programUserAccounts = await clearingHouse.program.account.user.all();
        const diff = programUserAccounts.filter(x => !usersSeen.has(x.publicKey.toString()));
        async.map(diff, initUser);
    }

    const getUserAccounts = async () => {
        console.log("Getting users")                        
        const programUserAccounts = await clearingHouse.program.account.user.all();         
        async.map(programUserAccounts, initUser);
        const user_delay = Number(process.env.USER_DELAY!);
        setInterval(updateUserAccounts, user_delay);
    };            

    await getUserAccounts();       

    function sleep(ms: number) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

    async function processUser(user: ClearingHouseUser) {
        // console.log('processing user:', user.authority.toString());
        const [canLiquidate] = user.canBeLiquidated();
        while (true) {
            if (canLiquidate) {
                const liquidateeUserAccountPublicKey =
                await user.getUserAccountPublicKey();

                try {
                    clearingHouse
                        .liquidate(liquidateeUserAccountPublicKey)
                        .then((tx) => {
                            console.log(`Liquidated user: ${user.authority} Tx: ${tx}`);
                        });
                } catch (e) {
                    console.log(e);
                }
            }
            //  else {
            //     console.log(`User not liquidatable: ${user.authority}`)                
            // }
            const liquidation_delay = Number(process.env.LIQUIDATION_DELAY);
            await sleep(liquidation_delay);
        }
    }    
}

main()
