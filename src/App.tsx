import { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  useConnection,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
function Wallerbtn() {
  const { publicKey } = useWallet();
  return (
    <div className="sticky top-4 z-50 ml-auto w-fit rounded-xl border border-white/15 bg-slate-900/70 p-1.5 shadow-lg backdrop-blur md:fixed md:right-4 md:top-4">
      {!publicKey && <WalletMultiButton />}
      {publicKey && <WalletDisconnectButton />}
    </div>
  );
}
//  const UserAddress = ()=>{
//   const { publicKey } = useWallet();
//   return (<div className="text-white">
//    {publicKey?.toString()}
//   </div>)
//  }
function UserAddress() {
  // require to  get address
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  // use effect to get balance of the wallet
  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((balance) => {
        setBalance(balance);
      });
    } else {
      setBalance(0);
    }
  }, [publicKey, connection]);

  // just to add little details
  const shortAddress = useMemo(() => {
    if (!publicKey) {
      return "-";
    }
    const key = publicKey.toString();
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }, [publicKey]);
  // convert balance to sol and fix to 4 decimal places
  const solBalance = useMemo(() => {
    return (balance / 1_000_000_000).toFixed(4);
  }, [balance]);

  return (
    // main container
    <div className="w-full rounded-2xl border border-white/20 bg-linear-to-br from-slate-900/90 via-slate-800/80 to-cyan-900/70 p-4 text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20 sm:p-5 md:fixed md:left-4 md:top-24 md:w-[320px]">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">    
            {/* // this spans is for the ping animation when wallet is connected or not */}
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                publicKey ? "animate-ping bg-emerald-300" : "animate-ping bg-rose-300"
              }`}
            ></span>
            {/* // this span is for the actual dot that shows the status of the wallet red for not connected and green for connected */}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                publicKey ? "bg-emerald-400" : "bg-rose-400"
              }`}
            ></span>
          </span>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Wallet</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            publicKey
              ? "bg-emerald-400/20 text-emerald-300"
              : "bg-rose-400/20 text-rose-300"
          }`}
        >
          {publicKey ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="rounded-xl bg-black/25 p-3 ring-1 ring-white/10 transition-colors duration-300 hover:bg-black/35">
          <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-300">Address</p>
          <p className="truncate font-mono text-xs text-slate-100" title={publicKey ? publicKey.toString() : ""}>
            {publicKey ? publicKey.toString() : "Connect wallet"}
          </p>
          <p className="mt-1 text-[11px] text-cyan-300">Short: {shortAddress}</p>
        </div>

        <div className="rounded-xl bg-black/25 p-3 ring-1 ring-white/10 transition-colors duration-300 hover:bg-black/35">
          <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-300">Balance</p>
          <p className="text-xl font-semibold text-white transition-transform duration-300 hover:scale-[1.02]">
            {publicKey ? `${solBalance} SOL` : "0.0000 SOL"}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Devnet RPC</p>
        </div>
      </div>
    </div>
  );
}
function SendTransaction() {
  // require to send transaction
  //and send transaction  comes from solana wallet adapter which send the req 
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSend() {
    // input checking
    if (!publicKey) {
      setStatus("error");
      setMessage("Connect wallet first");
      return;
    }

    try {
      setStatus("sending");
      setMessage("Preparing transaction...");

      const lamports = Math.floor(Number(amount) * 1_000_000_000);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          // our pub key come from usewallet 
          fromPubkey: publicKey,
          // topub key come from input
          toPubkey: new PublicKey(address),
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      setStatus("success");
      setMessage(`Sent! Tx: ${signature.slice(0, 10)}...`);
      setAmount("");
      setAddress("");
    } catch {
      setStatus("error");
      setMessage("Transaction failed. Check address/amount.");
    }
  }

  const canSend = !!publicKey && Number(amount) > 0 && address.trim().length > 20;

  return (
    <div className="w-full rounded-2xl border border-cyan-300/20 bg-linear-to-br from-slate-900/95 via-slate-800/90 to-cyan-950/80 p-4 text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-400/20 sm:p-5 md:fixed md:right-4 md:top-24 md:w-90">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Send SOL</p>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            status === "success"
              ? "bg-emerald-400/20 text-emerald-300"
              : status === "error"
              ? "bg-rose-400/20 text-rose-300"
              : status === "sending"
              ? "bg-amber-400/20 text-amber-300"
              : "bg-slate-400/20 text-slate-300"
          }`}
        >
          {status === "idle" ? "Ready" : status}
        </span>
      </div>

      <div className="space-y-2.5">
        <input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          type="text"
          placeholder="Recipient address"
          className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 outline-none ring-cyan-300/40 transition focus:border-cyan-300/40 focus:ring-2"
        />

        <input
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min="0"
          step="0.0001"
          placeholder="Amount in SOL"
          className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-400 outline-none ring-cyan-300/40 transition focus:border-cyan-300/40 focus:ring-2"
        />

        <button
          onClick={handleSend}
          disabled={!canSend || status === "sending"}
          className="group relative mt-1 inline-flex w-full items-center justify-center overflow-hidden rounded-xl border border-cyan-200/30 bg-linear-to-r from-cyan-400 via-sky-400 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
          <span className="relative">{status === "sending" ? "Sending..." : "Send Transaction"}</span>
        </button>

        <p
          className={`min-h-4 text-[11px] ${
            status === "success"
              ? "text-emerald-300"
              : status === "error"
              ? "text-rose-300"
              : "text-slate-400"
          }`}
        >
          {message || "Use devnet SOL only"}
        </p>
      </div>
    </div>
  );
}
function App() {
  const endpoint =
    "https://devnet.helius-rpc.com/?api-key=33f00b00-8489-4b93-867d-044b5a82dc38";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <main className="min-h-screen bg-linear-to-b from-[#06151f] via-[#0a2231] to-[#06151f] px-4 py-4 text-white sm:px-6 md:px-8 md:py-6">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -left-12 top-24 h-44 w-44 rounded-full bg-cyan-500/15 blur-3xl"></div>
              <div className="absolute -right-8 bottom-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"></div>
            </div>

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:min-h-90 md:pt-16">
              <Wallerbtn />
              <UserAddress />
              <SendTransaction />
            </div>
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
