import React from "react";
import { ColorIndex, PaletteName, Palettes } from "./ColorData";

interface Props {
	SelectedColor: ColorIndex;
	SelectedPalette: PaletteName;
	OnSelectedColor: (color: ColorIndex) => void;
	OnSelectedPalette: (palette: PaletteName) => void;
}

const NumberColumns = 4;

const ColorPalette: React.FC<Props> = (props: Props) => {
	const paletteOptions = Object.keys(Palettes);
	const palette = Palettes[props.SelectedPalette];

	return (
		<div>
			{paletteOptions.map((name, _) => (
				<div
					key={name}
					title={name.toString()}
					style={{
						width: 80,
						height: 40,
						backgroundColor: "#808080",
						border:
							props.SelectedPalette === name
								? "4px solid #333"
								: "1px solid #333",
						boxSizing: "border-box",
					}}
					onClick={() => props.OnSelectedPalette(name as PaletteName)}
				/>
			))}

			<div
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${NumberColumns}, 40px)`,
					gap: "4px",
				}}
			>
				{palette.map((color, index) => (
					<div
						key={index}
						title={color.toString()}
						style={{
							width: 40,
							height: 40,
							backgroundColor:
								Palettes[props.SelectedPalette][index],
							border:
								props.SelectedColor === index
									? "4px solid #333"
									: "1px solid #333",
							boxSizing: "border-box",
						}}
						onClick={() => props.OnSelectedColor(index)}
					/>
				))}
			</div>
		</div>
	);
};

export default ColorPalette;
