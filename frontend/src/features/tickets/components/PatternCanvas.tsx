import React, { useRef, useEffect, useState } from 'react';
import { Paper, Text, Button, Stack, Group } from '@mantine/core';

interface PatternCanvasProps {
  onPatternComplete?: (pattern: string) => void;
  value?: string;
  mode?: 'draw' | 'view';
}

export function PatternCanvas({ onPatternComplete, value = '', mode = 'draw' }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [nodes, setNodes] = useState<{ x: number; y: number; id: number }[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const pathRef = useRef<number[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

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

  const draw = (currentPath: number[], currentX?: number, currentY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar líneas del camino
    if (currentPath.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6'; // Azul
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const firstNode = nodes.find(n => n.id === currentPath[0]);
      if (firstNode) {
        ctx.moveTo(firstNode.x, firstNode.y);
        currentPath.forEach(id => {
          const node = nodes.find(n => n.id === id);
          if (node) ctx.lineTo(node.x, node.y);
        });

        if (currentX !== undefined && currentY !== undefined && isDrawing && mode === 'draw') {
          ctx.lineTo(currentX, currentY);
        }
        ctx.stroke();
      }
    }

    // Dibujar los puntos
    nodes.forEach(node => {
      const active = currentPath.includes(node.id);
      ctx.beginPath();
      ctx.arc(node.x, node.y, active ? 12 : 8, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#3b82f6' : '#4b5563'; // azul activo, gris inactivo
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // Re-dibujar al cambiar modo o puntos
  useEffect(() => {
    if (mode === 'draw' && nodes.length > 0) {
      draw(path);
    }
  }, [nodes, path, isDrawing, mode]);

  // Modo View: Animación secuencial
  useEffect(() => {
    if (mode === 'view' && value && nodes.length > 0) {
      const parsedPath = value.split(/[,-]/).map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
      if (parsedPath.length === 0) {
        draw([]);
        return;
      }

      let currentIndex = 0;
      let isAnimating = true;

      const animate = () => {
        if (!isAnimating) return;

        const currentSlice = parsedPath.slice(0, currentIndex + 1);
        draw(currentSlice);

        if (currentIndex < parsedPath.length - 1) {
          currentIndex++;
          animationRef.current = window.setTimeout(animate, 500);
        } else {
          // Finalizó la secuencia, limpiar canvas y reiniciar tras 2 segundos
          animationRef.current = window.setTimeout(() => {
            if (isAnimating) {
              draw([]);
              currentIndex = 0;
              // Esperar un poco antes de iniciar de nuevo
              animationRef.current = window.setTimeout(animate, 500);
            }
          }, 2000);
        }
      };

      animate();

      return () => {
        isAnimating = false;
        if (animationRef.current) clearTimeout(animationRef.current);
      };
    } else if (mode === 'view') {
      draw([]);
    }
  }, [mode, value, nodes]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    setIsDrawing(true);
    setPath([]);
    pathRef.current = [];
    handleMove(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    let newPath = [...pathRef.current];
    let changed = false;

    nodes.forEach(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < 20 && !newPath.includes(node.id)) {
        newPath.push(node.id);
        changed = true;
      }
    });

    if (changed) {
      setPath(newPath);
      pathRef.current = newPath;
    }

    draw(pathRef.current, x, y);
  };

  const handleEnd = () => {
    if (mode !== 'draw') return;
    setIsDrawing(false);
    if (pathRef.current.length > 1 && onPatternComplete) {
      onPatternComplete(pathRef.current.join('-'));
    }
  };

  return (
    <Stack align="center" gap="xs">
      <Paper withBorder p="xs" radius="md" bg="gray.9" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={250}
          height={250}
          onMouseDown={mode === 'draw' ? handleStart : undefined}
          onMouseMove={mode === 'draw' ? handleMove : undefined}
          onMouseUp={mode === 'draw' ? handleEnd : undefined}
          onMouseLeave={mode === 'draw' ? handleEnd : undefined}
          onTouchStart={mode === 'draw' ? handleStart : undefined}
          onTouchMove={mode === 'draw' ? handleMove : undefined}
          onTouchEnd={mode === 'draw' ? handleEnd : undefined}
          style={{ cursor: mode === 'draw' ? 'crosshair' : 'default', display: 'block' }}
        />
      </Paper>
      {mode === 'draw' && (
        <Group justify="space-between" w="100%">
          <Text size="xs" c="dimmed">Patrón: {value || 'Dibuja arriba'}</Text>
          <Button size="compact-xs" variant="subtle" color="red" onClick={() => {
            setPath([]);
            pathRef.current = [];
            if (onPatternComplete) onPatternComplete('');
            draw([]);
          }}>
            Limpiar
          </Button>
        </Group>
      )}
    </Stack>
  );
}