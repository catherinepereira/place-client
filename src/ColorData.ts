export type ColorIndex = number;
export type ColorPalette = string[];
export type PaletteName = "default"; //| "pastel" | "retro";

export const Palettes: Record<PaletteName, ColorPalette> = {
	default: [
		"#f9fffe",
		"#b02e26",
		"#f9801d",
		"#fed83d",
		"#80c71f",
		"#5e7c16",
		"#169c9c",
		"#3ab3da",
		"#3c44aa",
		"#8932b8",
		"#c74ebd",
		"#f38baa",
		"#835432",
		"#1d1d21",
		"#474f52",
		"#9d9d97",
	],
	// pastel: [
	// 	"#ffd1dc",
	// 	"#ffb347",
	// 	"#fffacd",
	// 	"#d4f4dd",
	// 	"#a3d2ca",
	// 	"#7ec8e3",
	// 	"#b5ead7",
	// 	"#8ed2c9",
	// 	"#cdb4db",
	// 	"#ffd6e8",
	// 	"#fef9ef",
	// 	"#e0aaff",
	// 	"#9e9d24",
	// 	"#ce93d8",
	// 	"#f48fb1",
	// 	"#f5f5f5",
	// ],
	// retro: [
	// 	"#000000",
	// 	"#1a1a1a",
	// 	"#333333",
	// 	"#4d4d4d",
	// 	"#666666",
	// 	"#808080",
	// 	"#999999",
	// 	"#b3b3b3",
	// 	"#cccccc",
	// 	"#e6e6e6",
	// 	"#ffffff",
	// 	"#ff0000",
	// 	"#00ff00",
	// 	"#0000ff",
	// 	"#ffff00",
	// 	"#00ffff",
	// ],
};

/** Convert index to hex color for a given palette */
export function indexToColor(
	paletteName: PaletteName,
	index: ColorIndex
): string {
	const palette = Palettes[paletteName];
	if (index < 0 || index >= palette.length) {
		throw new Error(
			`Index ${index} out of range for palette ${paletteName}`
		);
	}
	return palette[index];
}
