import { b64ToBuf } from './crypto';

export async function loadIdentity(username: string) {
    const raw = localStorage.getItem(`keys-${username}`);
    if (!raw) throw new Error('No identity keys found');
    const { privateKey: privB64, publicKey: pubB64 } = JSON.parse(raw);
    const privKey = await crypto.subtle.importKey(
      'pkcs8', b64ToBuf(privB64),
      { name:'X25519', namedCurve:'X25519' },
      false, ['deriveBits','deriveKey']
    );
    const pubKey = await crypto.subtle.importKey(
      'spki', b64ToBuf(pubB64),
      { name:'X25519', namedCurve:'X25519' },
      false, []
    );
    return { privKey, pubKey };
  }