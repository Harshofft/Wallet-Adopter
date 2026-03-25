'use strict';

const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');

/**
 * WalletAdopter – create or import a Solana wallet and send SOL.
 */
class WalletAdopter {
  /**
   * @param {string} [rpcUrl] - Solana RPC endpoint (defaults to devnet).
   */
  constructor(rpcUrl = 'https://api.devnet.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.keypair = null;
  }

  /**
   * Generate a brand-new random keypair and adopt it as the active wallet.
   * @returns {{ publicKey: string, secretKey: Uint8Array }}
   */
  generateWallet() {
    this.keypair = Keypair.generate();
    return {
      publicKey: this.keypair.publicKey.toBase58(),
      secretKey: this.keypair.secretKey,
    };
  }

  /**
   * Import an existing wallet from a secret-key byte array.
   * @param {Uint8Array|number[]} secretKey
   * @returns {string} Public key (base58)
   */
  importWallet(secretKey) {
    this.keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    return this.keypair.publicKey.toBase58();
  }

  /**
   * Return the public key of the currently adopted wallet.
   * @returns {string}
   */
  getPublicKey() {
    this._requireWallet();
    return this.keypair.publicKey.toBase58();
  }

  /**
   * Fetch the SOL balance (in SOL, not lamports) of any address.
   * @param {string} [address] - defaults to the adopted wallet address.
   * @returns {Promise<number>}
   */
  async getBalance(address) {
    const pubkey = new PublicKey(address || this.getPublicKey());
    const lamports = await this.connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Send SOL from the adopted wallet to a recipient.
   * @param {string} recipientAddress - base58 public key of the recipient.
   * @param {number} amountSol - amount of SOL to send.
   * @returns {Promise<string>} Transaction signature.
   */
  async sendSol(recipientAddress, amountSol) {
    this._requireWallet();

    if (amountSol <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const recipient = new PublicKey(recipientAddress);
    const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey: recipient,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair]
    );

    return signature;
  }

  /**
   * Request an airdrop (devnet / testnet only) to the adopted wallet.
   * @param {number} [amountSol=1]
   * @returns {Promise<string>} Transaction signature.
   */
  async requestAirdrop(amountSol = 1) {
    this._requireWallet();
    const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      lamports
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  // ---------------------------------------------------------------------------

  _requireWallet() {
    if (!this.keypair) {
      throw new Error(
        'No wallet adopted. Call generateWallet() or importWallet() first.'
      );
    }
  }
}

module.exports = WalletAdopter;
