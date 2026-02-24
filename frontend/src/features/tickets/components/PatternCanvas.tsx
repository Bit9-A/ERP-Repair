import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Text, Button, Stack, Group } from '@mantine/core';

interface PatternCanvasProps {
  onPatternComplete: (pattern: string) => void;
  value?: string;
}

export function PatternCanvas({ onPatternComplete, value }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [nodes, setNodes] = useState<{ x: number; y: number; id: number }[]>([]);
  const [path, setPath] = useState<number[]>([]);

  // Configurar los 9 puntos (3x3)
  useEffect(() => {
    const newNodes = [];
    const size = 250; // Tamaño del canvas
    const padding = 40;
    const spacing = (size - padding * 2) / 2;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        newNodes.push({
          x: padding + col * spacing,
          y: padding + row * spacing,
          id: (row * 3) + col + 1
        });
      }
    }
    setNodes(newNodes);
  }, []);

  const draw = (currentX?: number, currentY?: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar líneas del camino
    if (path.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#228be6'; // Azul Mantine
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      
      const firstNode = nodes.find(n => n.id === path[0]);
      if (firstNode) {
        ctx.moveTo(firstNode.x, firstNode.y);
        path.forEach(id => {
          const node = nodes.find(n => n.id === id);
          if (node) ctx.lineTo(node.x, node.y);
        });
        
        if (currentX && currentY && isDrawing) {
          ctx.lineTo(currentX, currentY);
        }
        ctx.stroke();
      }
    }

    // Dibujar los puntos
    nodes.forEach(node => {
      const active = path.includes(node.id);
      ctx.beginPath();
      ctx.arc(node.x, node.y, active ? 12 : 8, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#228be6' : '#dee2e6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  useEffect(() => draw(), [nodes, path, isDrawing]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setPath([]);
    handleMove(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    nodes.forEach(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < 20 && !path.includes(node.id)) {
        setPath(prev => [...prev, node.id]);
      }
    });

    draw(x, y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    if (path.length > 1) {
      onPatternComplete(path.join('-'));
    }
  };

  return (
    <Stack align="center" gap="xs">
      <Paper withBorder p="xs" radius="md" bg="gray.9" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={250}
          height={250}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{ cursor: 'crosshair' }}
        />
      </Paper>
      <Group justify="space-between" w="100%">
        <Text size="xs" c="dimmed">Patrón: {value || 'Dibuja arriba'}</Text>
        <Button size="compact-xs" variant="subtle" color="red" onClick={() => { setPath([]); onPatternComplete(''); }}>
          Limpiar
        </Button>
      </Group>
    </Stack>
  );
}