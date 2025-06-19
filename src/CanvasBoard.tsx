import React, { useEffect, useRef, useState } from "react";

import { ColorIndex, PaletteName, Palettes } from "./ColorData";
import ColorPalette from "./ColorPalette";

const PALETTE_INDEX_LIMIT = 15;
const PIXEL_SIZE = 10;
const DEBUG_ENABLED = true;
const WARNS_BYPASS_DEBUG_LIMIT = true;

interface CanvasProps {
	width: number;
	height: number;
}

const CanvasBoard: React.FC<CanvasProps> = (props) => {
	/** Width used for validation. Actual width is CANVAS_WIDTH_VISUAL */
	const CANVAS_WIDTH = props.width;
	/** Height used for validation. Actual height is CANVAS_HEIGHT_VISUAL */
	const CANVAS_HEIGHT = props.height;

	const CANVAS_WIDTH_VISUAL = CANVAS_WIDTH * PIXEL_SIZE;
	const CANVAS_HEIGHT_VISUAL = CANVAS_HEIGHT * PIXEL_SIZE;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
	const [selectedColor, setSelectedColor] = useState<ColorIndex>(0);
	const [selectedPalette, setSelectedPalette] =
		useState<PaletteName>("default");

	const writeDebug = (message: string, warn?: boolean) => {
		if (DEBUG_ENABLED || (warn && WARNS_BYPASS_DEBUG_LIMIT)) {
			warn ? console.warn(message) : console.log(message);
		}
	};

	const validateMessage = (x: number, y: number, color: number) => {
		if (x < 0 || x > CANVAS_WIDTH) {
			writeDebug(`X coord is out of range: ${x}`, true);
			return false;
		}
		if (y < 0 || y > CANVAS_HEIGHT) {
			writeDebug(`Y coord is out of range: ${y}`, true);
			return false;
		}
		if (color < 0 || color > PALETTE_INDEX_LIMIT) {
			writeDebug(`Color must be 4-bit (0–15): ${color}`, true);
			return false;
		}
		return true;
	};

	const packMessage = (
		x: number,
		y: number,
		color: number
	): Uint8Array | undefined => {
		const valid = validateMessage(x, y, color);
		if (!valid) return;

		const packedMessage = new Uint8Array(5);
		const dataView = new DataView(packedMessage.buffer);

		dataView.setUint16(0, x);
		dataView.setUint16(2, y);
		dataView.setUint8(4, color & 0x0f);

		writeDebug(`[Pack Message]: DataView ${dataView}`);

		return packedMessage;
	};

	const unpackMessage = (
		buffer: ArrayBuffer
	): { x: number; y: number; color: number } => {
		const view = new DataView(buffer);

		const x = view.getUint16(0);
		const y = view.getUint16(2);
		const color = view.getUint8(4) & 0x0f;

		return { x, y, color };
	};

	const sendMessage = (x: number, y: number, color: number) => {
		const packedMessage = packMessage(x, y, color);
		if (webSocket && packedMessage) {
			writeDebug(`[Send Message]: Sending message ${packedMessage}`);
			webSocket.send(packedMessage);
		}
	};

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080/ws");
		setWebSocket(socket);

		const handlePixelData = (x: number, y: number, color: number) => {
			const valid = validateMessage(x, y, color);
			if (!valid) return;

			const context = canvasRef.current?.getContext("2d");

			if (context) {
				context.fillStyle = Palettes[selectedPalette][color];
				context.fillRect(
					x * PIXEL_SIZE,
					y * PIXEL_SIZE,
					PIXEL_SIZE,
					PIXEL_SIZE
				);
			}
		};

		socket.onopen = () => writeDebug("Connected to WebSocket.");
		socket.onmessage = (event) =>
			writeDebug(`On message event: ${event.data}`);
		socket.onerror = (e) => writeDebug(`WebSocket error: ${e}`);
		socket.onclose = () => writeDebug(`WebSocket closed.`, true);

		socket.onmessage = (event) => {
			const buffer = event.data;

			if (buffer instanceof Blob) {
				buffer.arrayBuffer().then((ab) => {
					const { x, y, color } = unpackMessage(ab);
					writeDebug(
						`[On Message]: Received message: ${x}, ${y}, ${color}`
					);
					handlePixelData(x, y, color);
				});
			} else {
				writeDebug(`Unknown message format: ${buffer}`, true);
			}
		};

		return () => socket.close();
	}, [selectedPalette]);

	const onClick = (e: React.MouseEvent) => {
		if (!webSocket) return;
		if (!canvasRef) return;
		const rect = canvasRef.current!.getBoundingClientRect();

		// Ensure coords are within bounds
		const xOffset = e.clientX - rect.left;
		const yOffset = e.clientY - rect.top;
		const x = Math.floor(xOffset / PIXEL_SIZE);
		const y = Math.floor(yOffset / PIXEL_SIZE);
		const color = selectedColor;

		const valid = validateMessage(x, y, color);
		if (!valid) return;

		writeDebug(`[On Click]: X from client: ${x} \n Y from client: ${y}`);

		sendMessage(x, y, color);
	};

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={CANVAS_WIDTH_VISUAL}
				height={CANVAS_HEIGHT_VISUAL}
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
