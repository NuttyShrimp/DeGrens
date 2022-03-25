/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_GAME_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
