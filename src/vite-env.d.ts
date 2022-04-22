/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_RESAS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
