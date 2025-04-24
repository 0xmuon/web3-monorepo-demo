import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as fs from 'fs';

async function verifyToken(connection: Connection, mintAddress: string) {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const token = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      {
        publicKey: mintPublicKey,
        secretKey: new Uint8Array(64) // This is a dummy signer since we're only reading
      }
    );
    const mintInfo = await token.getMintInfo();
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
  
  // Load the keypair from the file
  const keypairFile = fs.readFileSync('keypair.json', 'utf-8');
  const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairFile)));

  console.log('Creating token with keypair:', keypair.publicKey.toBase58());

  // Create a new token
  const token = await Token.createMint(
    connection,
    keypair,
    keypair.publicKey,
    keypair.publicKey,
    9, // 9 decimals
    TOKEN_PROGRAM_ID
  );

  console.log('Token created:', token.publicKey.toBase58());

  // Create associated token account for the creator
  const associatedTokenAccount = await token.createAssociatedTokenAccount(keypair.publicKey);

  console.log('Associated token account created:', associatedTokenAccount.toBase58());

  // Mint some tokens to the creator
  await token.mintTo(
    associatedTokenAccount,
    keypair,
    [],
    1000000000 // 1 billion tokens (with 9 decimals)
  );

  console.log('Tokens minted successfully');
}

main().catch(console.error); 