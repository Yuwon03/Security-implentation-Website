export async function generateX25519KeyPair() {
    const kp = await crypto.subtle.generateKey(
      { name: 'X25519', namedCurve: 'X25519' },
      true,
      ['deriveKey','deriveBits']
    );
    const pubSpki   = await crypto.subtle.exportKey('spki',  kp.publicKey);
    const privPKcs8 = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
    const toBase64 = (buf: ArrayBuffer) =>
      btoa(String.fromCharCode(...new Uint8Array(buf)));
    return {
      publicKey:  toBase64(pubSpki),
      privateKey: toBase64(privPKcs8),
    };
  }
  
  export function b64ToBuf(b64: string): ArrayBuffer {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
  }
  
  export function bufToB64(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }
  
  export async function deriveSharedSecret(
    myPrivKey: CryptoKey,
    theirPubB64: string
  ): Promise<ArrayBuffer> {
    const pubBuf = b64ToBuf(theirPubB64);
    const theirPub = await crypto.subtle.importKey(
      'spki',
      pubBuf,
      { name: 'X25519', namedCurve: 'X25519' },
      false,
      []
    );
    return crypto.subtle.deriveBits(
      { name: 'X25519', public: theirPub },
      myPrivKey,
      256
    );
  }
  
  export async function deriveKeys(sharedSecret: ArrayBuffer) {
    const hkdfKey = await crypto.subtle.importKey(
      'raw',
      sharedSecret,
      'HKDF',
      false,
      ['deriveKey']
    );
    const salt    = new Uint8Array(); 
    const infoEnc = new TextEncoder().encode('enc');
    const infoMac = new TextEncoder().encode('mac');
  
    const keyEnc = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: infoEnc
      },
      hkdfKey,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt','decrypt']
    );
  
    const keyMac = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: infoMac
      },
      hkdfKey,
      { name: 'HMAC', hash: 'SHA-256', length: 256 },
      false,
      ['sign','verify']
    );
  
    return { keyEnc, keyMac };
  }
  
  export async function encryptThenMac(
    keyEnc: CryptoKey,
    keyMac: CryptoKey,
    message: string
  ) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const pt = new TextEncoder().encode(message);
    const ctBuf = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      keyEnc,
      pt
    );
    const ct = new Uint8Array(ctBuf);
  
    const data = new Uint8Array(iv.byteLength + ct.byteLength);
    data.set(iv, 0);
    data.set(ct, iv.byteLength);
  
    const tagBuf = await crypto.subtle.sign('HMAC', keyMac, data);
    const tag    = new Uint8Array(tagBuf);
  
    return {
      iv:  bufToB64(iv.buffer),
      ct:  bufToB64(ct.buffer),
      tag: bufToB64(tag.buffer),
    };
  }
  
  export async function decryptThenVerify(
    keyEnc: CryptoKey,
    keyMac: CryptoKey,
    ivB64: string,
    ctB64: string,
    tagB64: string
  ) {
    const iv  = new Uint8Array(b64ToBuf(ivB64));
    const ct  = new Uint8Array(b64ToBuf(ctB64));
    const tag = new Uint8Array(b64ToBuf(tagB64));
  
    const data = new Uint8Array(iv.byteLength + ct.byteLength);
    data.set(iv, 0);
    data.set(ct, iv.byteLength);
  
    const valid = await crypto.subtle.verify('HMAC', keyMac, tag, data);
    if (!valid) throw new Error('MAC mismatch — message tampered');
  
    const ptBuf = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      keyEnc,
      ct
    );
    return new TextDecoder().decode(ptBuf);
  }
  