import React, { useEffect, useRef, useState } from "react";
import { Color, HexColorData, hexToRgb, rgbToHex } from "./ColorData";
import ColorPalette from "./ColorPalette";

const CANVAS_SIZE = 1000;
const PIXEL_SIZE = 10;

interface PixelData {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

const CanvasBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.Pink);

  const packMessage = (data: PixelData): string => {
    const { x, y, r, g, b } = data;
    const packedRgb = (r << 16) | (g << 8) | b;

    const message = `${x},${y},${packedRgb}`;
    return message;
  };

  const unpackMessage = (message: string): PixelData => {
    const messageSplit = message.split(",");
    const x = Number(messageSplit[0]);
    const y = Number(messageSplit[1]);
    const packedRgb = Number(messageSplit[2]);

    const r = (packedRgb >> 16) & 0xff;
    const g = (packedRgb >> 8) & 0xff;
    const b = packedRgb & 0xff;

    return {
      x,
      y,
      r,
      g,
      b,
    };
  };

  const sendMessage = (message: string) => {
    if (ws) ws.send(JSON.stringify(message));
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    setWs(socket);

    const handlePixelData = (data: PixelData) => {
      const ctx = canvasRef.current?.getContext("2d");

      if (ctx) {
        const { x, y, r, g, b } = data;
        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    };

    socket.onopen = () => console.log("Connected to WebSocket.");
    socket.onmessage = (event) => console.log("On message event:", event.data);
    socket.onerror = (e) => console.error("WebSocket error:", e);
    socket.onclose = () => console.warn("WebSocket closed.");

    socket.onmessage = (msg) => {
      const parsedMsg = JSON.parse(msg.data);

      if (Array.isArray(parsedMsg)) {
        parsedMsg.forEach((msg) => {
          const pixelData = unpackMessage(msg);
          handlePixelData(pixelData);
        });
      } else {
        const pixelData = unpackMessage(parsedMsg);
        handlePixelData(pixelData);
      }
    };

    return () => socket.close();
  }, []);

  const onClick = (e: React.MouseEvent) => {
    if (!ws) return;
    if (!canvasRef) return;
    const rect = canvasRef.current!.getBoundingClientRect();

    // Ensure coords are within bounds
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);

    // Fetch rgb values of current selected color
    const { r, g, b } = hexToRgb(HexColorData[selectedColor]);

    const packedMessage = packMessage({ x, y, r, g, b });
    sendMessage(packedMessage);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ border: "1px solid black" }}
        onClick={onClick}
      />
      <ColorPalette
        SelectedColor={selectedColor}
        OnSelectedColor={setSelectedColor}
      />
    </div>
  );
};

export default CanvasBoard;
