# Wallet-Adopter

A Node.js library and CLI for generating Solana wallets and sending SOL.

## Installation

```bash
npm install
```

## CLI Usage

### Generate a new wallet

```bash
node index.js generate
```

Outputs a public key and the secret key as a JSON array.  
**Keep the secret key safe – do not share it.**

### Check SOL balance

```bash
node index.js balance <publicKey>
```

### Send SOL to an address

```bash
node index.js send <recipientAddress> <amountSol> '<secretKeyJson>'
```

Example:

```bash
node index.js send 9xQeWvG... 0.5 '[1,2,3,...]'
```

### Request a devnet airdrop (testing only)

```bash
node index.js airdrop [amountSol] '<secretKeyJson>'
```

## Programmatic Usage

```js
const WalletAdopter = require('./src/WalletAdopter');

const adopter = new WalletAdopter(); // defaults to devnet

// Generate a new wallet
const { publicKey, secretKey } = adopter.generateWallet();
console.log('Public Key:', publicKey);

// Import an existing wallet
adopter.importWallet(secretKey);

// Check balance
const balance = await adopter.getBalance();
console.log('Balance:', balance, 'SOL');

// Send SOL
const signature = await adopter.sendSol('<recipientAddress>', 0.1);
console.log('Transaction signature:', signature);
```

## Tests

```bash
npm test
```
