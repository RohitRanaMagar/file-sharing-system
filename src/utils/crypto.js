export async function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
    if (i === 2) code += '-'
  }
  return code
}

export async function deriveKey(code, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(code), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptFile(file, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(code, salt)

  const fileData = await file.arrayBuffer()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, fileData
  )

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  const ext = file.name.split('.').pop()
  const encryptedName = `encrypted_${Date.now()}.${ext}.enc`
  return new File([combined], encryptedName, { type: 'application/octet-stream' })
}

export async function decryptFile(encryptedBlob, code) {
  const data = new Uint8Array(await encryptedBlob.arrayBuffer())
  const salt = data.slice(0, 16)
  const iv = data.slice(16, 28)
  const encrypted = data.slice(28)

  const key = await deriveKey(code, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, encrypted
  )

  return new Blob([decrypted])
}

export async function encryptExistingFile(existingBlob, code) {
  return encryptFile(
    new File([existingBlob], 'file.bin'),
    code
  )
}
