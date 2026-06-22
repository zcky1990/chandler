/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPERBASE_URL: string
  readonly VITE_SUPERBASE_PUBLISH_KEY: string
  readonly VITE_PAYMENT_PROOF_WHATSAPP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
