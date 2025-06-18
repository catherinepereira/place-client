import React, { useEffect, useRef, useState } from "react";

import { ColorIndex, PaletteName, Palettes } from "./ColorData";
import ColorPalette from "./ColorPalette";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const PIXEL_SIZE = 10;

const CanvasBoard: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
	const [selectedColor, setSelectedColor] = useState<ColorIndex>(0);
	const [selectedPalette, setSelectedPalette] =
		useState<PaletteName>("default");

	const packMessage = (x: number, y: number, color: number): Uint8Array => {
		if (x < 0 || x > 1000) throw new Error("x coord is out of range");
		if (y < 0 || y > 1000) throw new Error("y coord is out of range");

		if (color < 0 || color > 15) {
			throw new Error("Color must be 4-bit (0–15)");
		}

		const msg = new Uint8Array(5);
		const view = new DataView(msg.buffer);

		view.setUint16(0, x, true);
		view.setUint16(2, y, true);
		view.setUint8(4, color & 0x0f);

		return msg;
	};

	const unpackMessage = (
		buffer: ArrayBuffer
	): { x: number; y: number; color: number } => {
		const view = new DataView(buffer);

		const x = view.getUint16(0, true);
		const y = view.getUint16(2, true);
		const color = view.getUint8(4) & 0x0f;

		return { x, y, color };
	};

	const sendMessage = (x: number, y: number, color: number) => {
		const packedMessage = packMessage(x, y, color);
		if (webSocket) {
			console.log("Sending message", packedMessage);
			webSocket.send(packedMessage);
		}
	};

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080/ws");
		setWebSocket(socket);

		const handlePixelData = (x: number, y: number, color: number) => {
			const ctx = canvasRef.current?.getContext("2d");

			if (ctx) {
				ctx.fillStyle = Palettes[selectedPalette][color];
				ctx.fillRect(
					x * PIXEL_SIZE,
					y * PIXEL_SIZE,
					PIXEL_SIZE,
					PIXEL_SIZE
				);
			}
		};

		socket.onopen = () => console.log("Connected to WebSocket.");
		socket.onmessage = (event) =>
			console.log("On message event:", event.data);
		socket.onerror = (e) => console.error("WebSocket error:", e);
		socket.onclose = () => console.warn("WebSocket closed.");

		socket.onmessage = (event) => {
			const buffer = event.data;

			if (buffer instanceof Blob) {
				buffer.arrayBuffer().then((ab) => {
					const { x, y, color } = unpackMessage(ab);
					console.log("Received message:", x, y, color);
					handlePixelData(x, y, color);
				});
			} else {
				console.warn("Unknown message format:", buffer);
			}
		};

		return () => socket.close();
	}, [selectedPalette]);

	const onClick = (e: React.MouseEvent) => {
		if (!webSocket) return;
		if (!canvasRef) return;
		const rect = canvasRef.current!.getBoundingClientRect();

		// Ensure coords are within bounds
		const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
		const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

		const color = selectedColor;

		sendMessage(x, y, color);
	};

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={CANVAS_WIDTH}
				height={CANVAS_HEIGHT}
				style={{ border: "3px solid black" }}
				onClick={onClick}
			/>
			<ColorPalette
				SelectedColor={selectedColor}
				SelectedPalette={selectedPalette}
				OnSelectedColor={setSelectedColor}
				OnSelectedPalette={setSelectedPalette}
			/>
		</div>
	);
};

export default CanvasBoard;
