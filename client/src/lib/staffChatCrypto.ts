const PRIVATE_KEY_STORAGE = "kiini.staffChat.ecdh.private";
const PUBLIC_KEY_STORAGE = "kiini.staffChat.ecdh.public";

const encode = (value: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...(value instanceof Uint8Array ? value : new Uint8Array(value))));
const decode = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const asBuffer = (value: Uint8Array) => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;

async function deriveWrappingKey(privateKey: CryptoKey, publicKey: CryptoKey) {
  const bits = await crypto.subtle.deriveBits({ name: "ECDH", public: publicKey }, privateKey, 256);
  const hkdfKey = await crypto.subtle.importKey("raw", bits, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new TextEncoder().encode("kiini-staff-chat"), info: new TextEncoder().encode("message-key") },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function importPublicKey(value: string) {
  return crypto.subtle.importKey("raw", decode(value), { name: "ECDH", namedCurve: "P-256" }, false, []);
}

async function getPrivateKey() {
  const stored = localStorage.getItem(PRIVATE_KEY_STORAGE);
  if (!stored) return null;
  return crypto.subtle.importKey("pkcs8", decode(stored), { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
}

export async function ensureChatKeyPair() {
  const existing = localStorage.getItem(PUBLIC_KEY_STORAGE);
  const privateKey = await getPrivateKey();
  if (existing && privateKey) return existing;
  const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const publicKey = encode(await crypto.subtle.exportKey("raw", pair.publicKey));
  const privateKeyData = encode(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
  localStorage.setItem(PUBLIC_KEY_STORAGE, publicKey);
  localStorage.setItem(PRIVATE_KEY_STORAGE, privateKeyData);
  return publicKey;
}

export function getStoredChatPublicKey() {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
}

export async function encryptChatMessage(text: string, recipients: Array<{ userId: string; publicKey?: string | null }>) {
  const privateKey = await getPrivateKey();
  if (!privateKey) throw new Error("Chat encryption key is not available");
  const messageKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const messageKeyBytes = new Uint8Array(await crypto.subtle.exportKey("raw", messageKey));
  const bodyNonce = crypto.getRandomValues(new Uint8Array(12));
  const body = await crypto.subtle.encrypt({ name: "AES-GCM", iv: bodyNonce }, messageKey, new TextEncoder().encode(text));
  const encryptedKeys: Record<string, { nonce: string; key: string }> = {};
  for (const recipient of recipients) {
    if (!recipient.publicKey) continue;
    const wrappingKey = await deriveWrappingKey(privateKey, await importPublicKey(recipient.publicKey));
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, wrappingKey, asBuffer(messageKeyBytes));
    encryptedKeys[recipient.userId] = { nonce: encode(nonce), key: encode(wrapped) };
  }
  return { content: encode(body), encryptionNonce: encode(bodyNonce), encryptedKeys: JSON.stringify(encryptedKeys), encryptionVersion: "v1" };
}

export async function decryptChatMessage(message: { content: string; userId?: string | null; encryptionNonce?: string | null; encryptedKeys?: string | null; encryptionVersion?: string | null }, userId: string, senderPublicKey?: string | null) {
  if (message.encryptionVersion !== "v1" || !message.encryptedKeys || !message.encryptionNonce || !senderPublicKey) return message.content;
  const privateKey = await getPrivateKey();
  if (!privateKey) return "[Encrypted message: this device has no chat key]";
  try {
    const wrappedKeys = JSON.parse(message.encryptedKeys) as Record<string, { nonce: string; key: string }>;
    const wrapped = wrappedKeys[userId] || (message.userId ? wrappedKeys[message.userId] : undefined);
    if (!wrapped) return "[Encrypted message: you are not a channel recipient]";
    const wrappingKey = await deriveWrappingKey(privateKey, await importPublicKey(senderPublicKey));
    const rawMessageKey = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(wrapped.nonce) }, wrappingKey, asBuffer(decode(wrapped.key)));
    const messageKey = await crypto.subtle.importKey("raw", rawMessageKey, { name: "AES-GCM" }, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(message.encryptionNonce) }, messageKey, asBuffer(decode(message.content)));
    return new TextDecoder().decode(plain);
  } catch {
    return "[Encrypted message could not be decrypted]";
  }
}
