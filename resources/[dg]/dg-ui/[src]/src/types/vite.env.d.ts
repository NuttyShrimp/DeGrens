/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_GAME_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
