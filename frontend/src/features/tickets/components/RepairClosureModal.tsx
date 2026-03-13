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
} from "@mantine/core";
import { IconCameraPlus, IconX, IconBrandWhatsapp, IconFileDownload } from "@tabler/icons-react";
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

  // Convierte los archivos subidos (FileList o File[]) a Base64 strings (data URL)
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
      // Generar y descargar PPD Local
      await generateRepairPDF(ticket, fotos);
      notifications.show({
        title: "Documento Generado",
        message: "El PDF ha sido descargado en su dispositivo.",
        color: "green",
      });
      
      // Llamar función de Kanban que realiza el update del ticket en Base de Datos de forma transparente
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
    
    // Si el número es de 11 dígitos y empieza por 0 (ej: 04141234567), quitar el 0 y agregar 58
    if (phone.length === 11 && phone.startsWith("0")) {
      phone = "58" + phone.substring(1);
    } else if (phone.length === 10 && !phone.startsWith("58")) {
      // Si el usuario guardó 4141234567 sin el 0
      phone = "58" + phone;
    }
    
    // Texto formateado pre-llenado (URL Encode)
    const text = `¡Hola ${ticket.cliente.nombre}! Le escribimos desde *ERP-Repair Support*.\n\nLe informamos que su *${ticket.marca} ${ticket.modelo}* ha pasado las pruebas de calidad y ya se encuentra *REPARADO*.\n\nEl precio total acordado es de *$${ticket.precio_total_usd} USD*. Adjunto a este mensaje le enviamos el acta digital con detalles fotográficos de la intervención técnica.\n\nQuedamos a la espera de su visita para el retiro. ¡Saludos!`;
    const wameUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(wameUrl, "_blank");
  };

  if (!ticket) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cierre de Reparación (Acta Digital)"
      size="lg"
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <Text size="sm">
          Este equipo (<b>{ticket.equipo || `${ticket.marca} ${ticket.modelo}`}</b>) está a punto de marcarse como <b>REPARADO</b>.
        </Text>
        
        <Text size="sm" c="dimmed">
          Agrega fotografías de evidencia del funcionamiento. Estas fotos se anexarán a un PDF interactivo de forma local <b>y no consumirán almacenamiento de tu servidor</b>.
        </Text>

        {/* Dropzone/Selector de Fotos Temporales */}
        <Box p="md" style={(theme) => ({ border: `2px dashed ${theme.colors.gray[4]}`, borderRadius: 8 })}>
          <Stack align="center" gap="xs">
            {fotos.length < 4 && (
              <FileButton onChange={handleFotosChange} accept="image/png,image/jpeg,image/webp" multiple>
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconCameraPlus size={18} />}>
                    Subir Evidencias Fotográficas ({fotos.length}/4)
                  </Button>
                )}
              </FileButton>
            )}

            <SimpleGrid cols={4} spacing="xs" mt="md" w="100%">
              {fotos.map((src, i) => (
                <Box key={i} pos="relative">
                  <Image src={src} radius="sm" height={80} fit="cover" />
                  <ActionIcon
                    pos="absolute"
                    top={4}
                    right={4}
                    color="red"
                    variant="filled"
                    size="xs"
                    radius="xl"
                    onClick={() => quitarFoto(i)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
            {fotos.length === 0 && (
              <Text size="xs" c="dimmed" mt="xs">
                (Opcional) Las fotografías son útiles para comprobar ante el cliente fallas estéticas o validación funcional.
              </Text>
            )}
          </Stack>
        </Box>

        <Group justify="space-between" mt="lg">
          <Button variant="default" onClick={onClose}>
            Cancelar y Volver Atrás
          </Button>
          
          <Group>
            {/* Opción 1: Generar PDF Localmente y Marcar Como Listo */}
            <Button
              color="indigo"
              leftSection={<IconFileDownload size={18} />}
              loading={isGenerating}
              onClick={handleGenerateAndDownload}
            >
              Generar Acta (.PDF) y Trasladar
            </Button>

            {/* Opción 2: Solo útil si ya descargó el pdf, se habilita temporalmente para atajar a Whatsapp Web */}
            <Button
              color="green"
              variant="light"
              leftSection={<IconBrandWhatsapp size={18} />}
              onClick={handleSendWhatsApp}
            >
              WhatsApp Web
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
