declare namespace Config {
  interface Permissions {
    base: Record<string, number>
    extra: Record<string, number>
    labels: Record<string, string>
  }

  interface Config {
    permissions: Permissions;
    types: Record<string, string[]>
  }
}
