import { 
  Connection, 
  Keypair, 
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  getMint
} from '@solana/spl-token';
import * as fs from 'fs';

async function verifyToken(connection: Connection, mintAddress: string) {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mintPublicKey);
    console.log('Token exists!');
    console.log('Decimals:', mintInfo.decimals);
    console.log('Supply:', mintInfo.supply.toString());
    console.log('Mint Authority:', mintInfo.mintAuthority?.toBase58());
    console.log('Freeze Authority:', mintInfo.freezeAuthority?.toBase58());
    return true;
  } catch (error) {
    console.log('Token does not exist or is not a valid mint account');
    return false;
  }
}

async function main() {
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Verify existing token
  const existingMintAddress = 'mntLuRtjrYJACzkgFksuUzzbm9wvoJzz7vyjVBZ8E6p';
  console.log('Verifying existing token...');
  const tokenExists = await verifyToken(connection, existingMintAddress);
  
  if (tokenExists) {
    console.log('Token already exists. No need to create a new one.');
    return;
  }
  
  // Load or create a keypair for the payer
  let payer: Keypair;
  try {
    const secretKey = JSON.parse(fs.readFileSync('payer-keypair.json', 'utf-8'));
    payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch (e) {
    console.log('Creating new keypair...');
    payer = Keypair.generate();
    fs.writeFileSync('payer-keypair.json', JSON.stringify(Array.from(payer.secretKey)));
  }
  
  console.log('Payer public key:', payer.publicKey.toBase58());
  
  // Request airdrop if needed
  const balance = await connection.getBalance(payer.publicKey);
  if (balance < 1000000000) { // 1 SOL
    console.log('Requesting airdrop...');
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      1000000000 // 1 SOL
    );
    await connection.confirmTransaction(airdropSignature);
    console.log('Airdrop received');
  }
  
  // Create mint account
  console.log('Creating mint account...');
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority
    9 // decimals
  );
  
  console.log('Mint created:', mint.toBase58());
  
  // Create token account
  console.log('Creating token account...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  
  console.log('Token account created:', tokenAccount.address.toBase58());
  
  // Mint some tokens
  console.log('Minting tokens...');
  const mintAmount = 1000000000; // 1 billion tokens
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    mintAmount
  );
  
  console.log('Tokens minted successfully!');
  console.log('Mint address:', mint.toBase58());
  console.log('Token account:', tokenAccount.address.toBase58());
  console.log('Amount minted:', mintAmount);
}

main().catch(console.error); 