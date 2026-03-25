#!/usr/bin/env node
'use strict';

/**
 * Wallet-Adopter CLI
 *
 * Usage:
 *   node index.js generate
 *   node index.js balance <publicKey>
 *   node index.js send <recipientAddress> <amountSol> <secretKeyJson>
 *   node index.js airdrop [amountSol] <secretKeyJson>
 */

const WalletAdopter = require('./src/WalletAdopter');

const [, , command, ...args] = process.argv;

async function main() {
  const adopter = new WalletAdopter();

  switch (command) {
    case 'generate': {
      const { publicKey, secretKey } = adopter.generateWallet();
      console.log('New wallet generated!');
      console.log('Public Key :', publicKey);
      console.log('Secret Key :', JSON.stringify(Array.from(secretKey)));
      console.log(
        '\nIMPORTANT: Store your secret key securely. Do NOT share it with anyone.'
      );
      break;
    }

    case 'balance': {
      const [address] = args;
      if (!address) {
        console.error('Usage: node index.js balance <publicKey>');
        process.exit(1);
      }
      const balance = await adopter.getBalance(address);
      console.log(`Balance of ${address}: ${balance} SOL`);
      break;
    }

    case 'send': {
      const [recipient, amountStr, secretKeyJson] = args;
      if (!recipient || !amountStr || !secretKeyJson) {
        console.error(
          'Usage: node index.js send <recipientAddress> <amountSol> <secretKeyJson>'
        );
        process.exit(1);
      }
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) {
        console.error('amountSol must be a positive number');
        process.exit(1);
      }
      const secretKey = JSON.parse(secretKeyJson);
      adopter.importWallet(secretKey);
      console.log(`Sending ${amount} SOL to ${recipient} ...`);
      const sig = await adopter.sendSol(recipient, amount);
      console.log('Transaction confirmed!');
      console.log('Signature:', sig);
      break;
    }

    case 'airdrop': {
      const [amountOrKey, maybeKey] = args;
      let amount = 1;
      let secretKeyJson = amountOrKey;
      if (maybeKey !== undefined) {
        amount = parseFloat(amountOrKey);
        secretKeyJson = maybeKey;
      }
      if (!secretKeyJson) {
        console.error(
          'Usage: node index.js airdrop [amountSol] <secretKeyJson>'
        );
        process.exit(1);
      }
      const secretKey = JSON.parse(secretKeyJson);
      adopter.importWallet(secretKey);
      console.log(`Requesting ${amount} SOL airdrop (devnet/testnet only) ...`);
      const sig = await adopter.requestAirdrop(amount);
      console.log('Airdrop confirmed!');
      console.log('Signature:', sig);
      break;
    }

    default:
      console.log(
        'Wallet-Adopter – generate a Solana wallet and send SOL\n' +
          '\nCommands:\n' +
          '  generate                                        Generate a new wallet\n' +
          '  balance <publicKey>                             Check SOL balance\n' +
          '  send <recipient> <amountSol> <secretKeyJson>   Send SOL to an address\n' +
          '  airdrop [amountSol] <secretKeyJson>            Request devnet airdrop\n'
      );
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
