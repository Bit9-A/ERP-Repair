import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  Button,
  Badge,
  Loader,
} from "@mantine/core";
import { IconScan, IconX, IconCameraRotate } from "@tabler/icons-react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  opened: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

export function BarcodeScanner({
  opened,
  onClose,
  onDetected,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>("barcode-reader-" + Date.now());
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore errors on stop
    }
    scannerRef.current = null;
  };

  const startScanner = async () => {
    setIsStarting(true);
    setError(null);

    // Small delay to ensure the DOM element is mounted
    await new Promise((r) => setTimeout(r, 300));

    const el = document.getElementById(containerRef.current);
    if (!el) {
      setError("No se pudo inicializar el escáner");
      setIsStarting(false);
      return;
    }

    try {
      const scanner = new Html5Qrcode(containerRef.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          setLastCode(decodedText);
          onDetected(decodedText);
        },
        () => {
          // ignore scan failures (no code in frame)
        },
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al acceder a la cámara";
      if (msg.includes("Permission")) {
        setError("Permiso de cámara denegado. Habilita el acceso en ajustes.");
      } else if (msg.includes("NotFound") || msg.includes("Requested device")) {
        setError("No se encontró una cámara en este dispositivo.");
      } else {
        setError(msg);
      }
    }
    setIsStarting(false);
  };

  // Start/restart scanner when modal opens or camera flips
  useEffect(() => {
    if (opened) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, facingMode]);

  const handleClose = () => {
    stopScanner();
    setLastCode(null);
    setError(null);
    onClose();
  };

  const handleFlipCamera = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconScan size={20} color="#22C55E" />
          <Text fw={700}>Escanear Código de Barras</Text>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      styles={{
        body: { padding: "12px" },
      }}
    >
      <Stack gap="sm">
        {/* Camera viewfinder */}
        <Paper
          radius="md"
          style={{
            overflow: "hidden",
            background: "#000",
            border: "2px solid var(--border-subtle)",
            position: "relative",
            minHeight: 300,
          }}
        >
          <div
            id={containerRef.current}
            style={{ width: "100%", minHeight: 300 }}
          />

          {isStarting && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.7)",
                zIndex: 10,
              }}
            >
              <Loader color="green" size="lg" />
              <Text size="sm" c="dimmed" mt="sm">
                Iniciando cámara...
              </Text>
            </div>
          )}
        </Paper>

        {/* Error message */}
        {error && (
          <Paper
            p="sm"
            radius="md"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <Text size="sm" c="red.4" ta="center">
              {error}
            </Text>
          </Paper>
        )}

        {/* Last detected code */}
        {lastCode && (
          <Paper
            p="sm"
            radius="md"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <Group justify="center" gap="xs">
              <Badge variant="light" color="green" size="sm">
                Detectado
              </Badge>
              <Text size="sm" fw={600} ff="monospace">
                {lastCode}
              </Text>
            </Group>
          </Paper>
        )}

        {/* Instructions */}
        <Text size="xs" c="dimmed" ta="center">
          Apunta la cámara al código de barras del producto. Se agregará
          automáticamente al carrito.
        </Text>

        {/* Actions */}
        <Group justify="space-between">
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconCameraRotate size={16} />}
            onClick={handleFlipCamera}
          >
            Voltear cámara
          </Button>
          <Button
            variant="light"
            color="red"
            size="sm"
            leftSection={<IconX size={16} />}
            onClick={handleClose}
          >
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
