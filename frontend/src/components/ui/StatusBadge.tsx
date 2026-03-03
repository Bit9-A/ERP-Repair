import { Badge } from "@mantine/core";
import { TICKET_STATUS } from "../../lib/constants";
import { getStockStatus } from "../../lib/constants";
import type { EstadoTicket } from "../../types";

interface StatusBadgeProps {
  status: EstadoTicket;
}

export function TicketStatusBadge({ status }: StatusBadgeProps) {
  const config = TICKET_STATUS[status];
  return (
    <Badge variant="filled" color={config.color} size="sm" radius="sm">
      {config.label}
    </Badge>
  );
}

interface StockBadgeProps {
  actual: number;
  minimo: number;
}

export function StockStatusBadge({ actual, minimo }: StockBadgeProps) {
  const config = getStockStatus(actual, minimo);
  return (
    <Badge variant="filled" color={config.color} size="sm" radius="sm">
      {config.label}
    </Badge>
  );
}
