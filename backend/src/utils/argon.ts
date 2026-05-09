import * as argon from 'argon2';

export async function hash(password: string): Promise<string> {
  return await argon.hash(password);
}

export async function verify(password: string, hash: string): Promise<boolean> {
  return argon.verify(hash, password);
}
