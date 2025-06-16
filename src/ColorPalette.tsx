import React from "react";
import { Color, HexColorData } from "./ColorData";

interface Props {
	SelectedColor: Color;
	OnSelectedColor: (color: Color) => void;
}

const NumberColumns = 4;

const ColorPalette: React.FC<Props> = (props: Props) => {
	const colors = Object.values(Color).filter(
		(value) => typeof value === "number"
	) as Color[];

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(${NumberColumns}, 40px)`,
				gap: "4px",
			}}
		>
			{colors.map((color, i) => (
				<div
					key={i}
					title={color.toString()}
					style={{
						width: 40,
						height: 40,
						backgroundColor: HexColorData[color],
						border:
							props.SelectedColor === color
								? "4px solid #333"
								: "1px solid #333",
						boxSizing: "border-box",
					}}
					onClick={() => props.OnSelectedColor(color)}
				/>
			))}
		</div>
	);
};

export default ColorPalette;
