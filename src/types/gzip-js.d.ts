declare module 'gzip-js' {
  export function compress(data: string | Uint8Array): Uint8Array
  export function decompress(data: Uint8Array): Uint8Array
} 