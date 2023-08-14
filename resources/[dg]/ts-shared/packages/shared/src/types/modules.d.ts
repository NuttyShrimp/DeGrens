declare module 'nearest-color' {
  export function from(
    colors: Record<string, string>
  ): (color: { r: number; g: number; b: number } | `#${string}`) => { name: string };
}
