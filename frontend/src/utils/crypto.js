const SECRET = process.env.REACT_APP_ENCRYPT_SECRET; // 32 hex chars = 16 bytes

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getKey() {
  return crypto.subtle.importKey(
    'raw', hexToBytes(SECRET), { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = new TextEncoder().encode(String(plainText));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, encoded);
  return bytesToHex(iv) + ':' + bytesToHex(new Uint8Array(encrypted));
}

export async function decryptData(cipherText) {
  const [ivHex, encHex] = cipherText.split(':');
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: hexToBytes(ivHex) }, key, hexToBytes(encHex)
  );
  return new TextDecoder().decode(decrypted);
}
