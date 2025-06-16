export enum Color {
  Red,
  Orange,
  Yellow,
  Green,
  Blue,
  Purple,
  Pink,
  Brown,
  Black,
  White,
}

export const HexColorData: { [key in Color]: string } = {
  [Color.Red]: "#ff0000",
  [Color.Orange]: "#ffa500",
  [Color.Yellow]: "#ffff00",
  [Color.Green]: "#008000",
  [Color.Blue]: "#0000ff",
  [Color.Purple]: "#800080",
  [Color.Pink]: "#ffc0cb",
  [Color.Brown]: "#a52a2a",
  [Color.Black]: "#000000",
  [Color.White]: "#ffffff",
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace(/^#/, "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, val));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
