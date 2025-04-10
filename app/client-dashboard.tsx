import { fetchUser } from './lib/api';

export async function fetchUserData(wallet: string) {
  return fetchUser(wallet);
} 