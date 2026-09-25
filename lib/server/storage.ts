import 'server-only'
import { del, get, put } from '@vercel/blob'

/**
 * Object storage abstraction. The provider is selected with
 * STORAGE_PROVIDER (default: "vercel-blob"). Add new providers (e.g. S3)
 * by implementing this interface; callers only deal in storage keys.
 */
interface StorageProvider {
  name: string
  put(key: string, body: Buffer | Blob | ArrayBuffer, contentType: string): Promise<{ key: string; size: number }>
  get(key: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string; size: number } | null>
  remove(key: string): Promise<void>
}

const vercelBlob: StorageProvider = {
  name: 'vercel-blob',
  async put(key, body, contentType) {
    const result = await put(key, body as Buffer, {
      access: 'private',
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    const size = body instanceof Blob ? body.size : (body as ArrayBuffer).byteLength
    return { key: result.pathname, size }
  },
  async get(key) {
    const result = await get(key, { access: 'private' })
    if (!result || result.statusCode !== 200) return null
    return { stream: result.stream, contentType: result.blob.contentType, size: result.blob.size }
  },
  async remove(key) {
    await del(key)
  },
}

const providers: Record<string, StorageProvider> = { 'vercel-blob': vercelBlob }

export function getStorage(): StorageProvider {
  const name = process.env.STORAGE_PROVIDER ?? 'vercel-blob'
  const provider = providers[name]
  if (!provider) throw new Error(`Unsupported STORAGE_PROVIDER "${name}"`)
  return provider
}
