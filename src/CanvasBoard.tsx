import React, { useEffect, useRef, useState } from 'react';

const CANVAS_SIZE = 1000;
const PIXEL_SIZE = 10;

const CanvasBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");
    setWs(socket);

    socket.onopen = () => {
        console.log("Connected to WebSocket");
        //socket.send(JSON.stringify({ x: 5, y: 5, color: "#000000" }));
    };

    socket.onmessage = (event) => {
        console.log("On message:", event.data);
    };

    socket.onerror = (e) => console.error("WebSocket error:", e);
    socket.onclose = () => console.warn("WebSocket closed");

    socket.onmessage = (msg) => {
      const { x, y, color } = JSON.parse(msg.data);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    };

    return () => socket.close();
  }, []);

  const drawPixel = (e: React.MouseEvent) => {
    if (!ws) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    const color = '#000000';

    ws.send(JSON.stringify({ x, y, color }));
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{ border: '1px solid black' }}
      onClick={drawPixel}
    />
  );
};

export default CanvasBoard;
