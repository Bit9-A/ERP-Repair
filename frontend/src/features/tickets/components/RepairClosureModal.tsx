import { useState } from "react";
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  FileButton,
  Image,
  ActionIcon,
  SimpleGrid,
  Box,
  ThemeIcon,
  Paper,
  Badge,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCameraPlus,
  IconX,
  IconBrandWhatsapp,
  IconFileDownload,
  IconCircleCheck,
  IconCertificate,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { TicketReparacion } from "../../../types";
import { generateRepairPDF } from "../../../services/pdf/generateRepairPDF";

interface RepairClosureModalProps {
  opened: boolean;
  onClose: () => void;
  ticket: TicketReparacion | null;
  onConfirm: (ticketId: string, fotosTemporales: string[]) => void;
}

export function RepairClosureModal({
  opened,
  onClose,
  ticket,
  onConfirm,
}: RepairClosureModalProps) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleFotosChange = (files: File[]) => {
    if (fotos.length + files.length > 4) {
      notifications.show({
        title: "Límite Excedido",
        message: "Puede adjuntar un máximo de 4 fotografías.",
        color: "orange",
      });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setFotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const quitarFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateAndDownload = async () => {
    if (!ticket) return;
    try {
      setIsGenerating(true);
      await generateRepairPDF(ticket, fotos);
      notifications.show({
        title: "Documento Generado",
        message: "El PDF ha sido descargado en su dispositivo.",
        color: "green",
      });
      onConfirm(ticket.id, fotos);
    } catch (e) {
      console.error(e);
      notifications.show({
        title: "Error Generando Acta",
        message: "No se pudo compilar el PDF.",
        color: "red",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!ticket || !ticket.cliente?.telefono) {
      notifications.show({
        title: "Dato Faltante",
        message: "El cliente de este ticket no registró su número de teléfono.",
        color: "yellow",
      });
      return;
    }
    let phone = ticket.cliente.telefono.replace(/\D/g, "");
    if (phone.length === 11 && phone.startsWith("0")) {
      phone = "58" + phone.substring(1);
    }

    const message = encodeURIComponent(
      `¡Hola ${ticket.cliente.nombre}! 👋 Le informamos desde el taller que su equipo ${ticket.marca} ${ticket.modelo} (Ticket #T-${ticket.id.substring(0, 6)}) ya ha sido REPARADO con éxito. Puede pasar a retirarlo cuando guste. ¡Gracias por su confianza!`,
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (!ticket) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="lg"
      fullScreen={isMobile}
      radius={isMobile ? 0 : 28}
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 5,
      }}
      shadow="2xl"
      transitionProps={{ transition: "pop", duration: 250 }}
      styles={{
        content: {
          borderRadius: isMobile ? 0 : "28px",
          overflow: "hidden",
          border: "none",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* ── Signature Sigepat Hero Header (Indigo) ── */}
      <Box
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
          padding: isMobile ? "16px 20px" : "24px 28px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Giant Watermark Background Icon */}
        <Box
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            opacity: 0.1,
            pointerEvents: "none",
            color: "white",
          }}
        >
          <IconCertificate size={120} strokeWidth={1.5} />
        </Box>

        <Group justify="space-between" align="flex-start" style={{ position: "relative", zIndex: 1 }}>
          <Group gap="sm" align="center">
            <ThemeIcon
              size={isMobile ? "md" : "xl"}
              radius="xl"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(4px)",
              }}
            >
              <IconCircleCheck size={isMobile ? 18 : 22} strokeWidth={2.5} />
            </ThemeIcon>
            <div>
              <Group gap="xs" align="center">
                <Text
                  size={isMobile ? "md" : "xl"}
                  fw={900}
                  className="font-heading tracking-tight"
                  c="white"
                >
                  Certificación & Cierre de Reparación
                </Text>
              </Group>
              <Text
                size="xs"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                Orden #T-{ticket.id.substring(0, 6)} • {ticket.marca} {ticket.modelo}
              </Text>
            </div>
          </Group>

          {/* Floating Glass Close Button */}
          <ActionIcon
            variant="subtle"
            radius="xl"
            size="md"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "white",
              backdropFilter: "blur(4px)",
            }}
          >
            <IconX size={16} strokeWidth={2.5} />
          </ActionIcon>
        </Group>
      </Box>

      {/* ── Modal Body ── */}
      <Stack gap="lg" p={isMobile ? "md" : "xl"}>
        {/* Evidencia Fotográfica */}
        <Paper
          p="md"
          radius="lg"
          withBorder
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts={1} className="font-heading">
                  Evidencia del Equipo Reparado
                </Text>
                <Text size="xs" c="dimmed">
                  Adjunta hasta 4 fotos que se imprimirán en el acta de entrega
                </Text>
              </div>

              <Badge variant="light" color={fotos.length >= 4 ? "orange" : "blue"} size="sm">
                {fotos.length} / 4 fotos
              </Badge>
            </Group>

            <Group gap="sm" mt="xs">
              <FileButton
                onChange={handleFotosChange}
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={fotos.length >= 4}
              >
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    color="indigo"
                    radius="xl"
                    size="sm"
                    leftSection={<IconCameraPlus size={16} strokeWidth={2.2} />}
                  >
                    Tomar o Subir Fotos
                  </Button>
                )}
              </FileButton>
            </Group>

            {fotos.length > 0 && (
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mt="xs">
                {fotos.map((src, index) => (
                  <Box
                    key={index}
                    style={{
                      position: "relative",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <Image
                      src={src}
                      h={100}
                      fit="cover"
                      alt={`Evidencia ${index + 1}`}
                    />
                    <ActionIcon
                      color="red"
                      variant="filled"
                      size="xs"
                      radius="xl"
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      }}
                      onClick={() => quitarFoto(index)}
                      aria-label="Eliminar foto"
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Paper>

        {/* Notificación al Cliente */}
        <Paper
          p="md"
          radius="lg"
          style={{
            background: "rgba(37, 211, 102, 0.08)",
            border: "1px solid rgba(37, 211, 102, 0.25)",
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="xs">
              <ThemeIcon size="lg" radius="xl" color="green" variant="filled">
                <IconBrandWhatsapp size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={700} c="green" className="font-heading">
                  Notificar al Cliente por WhatsApp
                </Text>
                <Text size="xs" c="dimmed">
                  Envía un mensaje predeterminado informando que el equipo está listo
                </Text>
              </div>
            </Group>

            <Button
              color="green"
              radius="xl"
              size="xs"
              variant="filled"
              leftSection={<IconBrandWhatsapp size={16} />}
              onClick={handleSendWhatsApp}
            >
              Abrir WhatsApp
            </Button>
          </Group>
        </Paper>

        {/* Footer Actions */}
        <Group justify="space-between" align="center" pt="xs">
          <Button
            variant="subtle"
            color="gray"
            radius="xl"
            onClick={onClose}
          >
            Volver sin Finalizar
          </Button>

          <Button
            color="indigo"
            radius="xl"
            size="md"
            loading={isGenerating}
            onClick={handleGenerateAndDownload}
            leftSection={<IconFileDownload size={18} strokeWidth={2.5} />}
            style={{
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
            }}
          >
            Generar Acta PDF y Mover a Reparado
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
