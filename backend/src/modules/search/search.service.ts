import prisma from "../../config/prisma";

export class SearchService {
  /**
   * Performs a parallel search across Tickets, Products, and Clients
   * @param query The search term
   * @param limit Limit results per category (default: 5)
   */
  async globalSearch(query: string, limit = 5) {
    // If search term is too short, return empty arrays to avoid heavy queries
    if (!query || query.length < 2) {
      return { tickets: [], productos: [], clientes: [] };
    }

    const searchStr = `%${query}%`;

    // 1. Search Tickets (Reparaciones)
    const ticketsPromise = prisma.ticketReparacion.findMany({
      where: {
        OR: [
          { equipo: { contains: query, mode: "insensitive" } },
          { falla_reportada: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        equipo: true,
        falla_reportada: true,
        estado: true,
      },
      take: limit,
      orderBy: { id: "desc" },
    });

    // 2. Search Products (Inventario)
    const productosPromise = prisma.producto.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        sku: true,
        stock_actual: true,
        precio_usd: true,
      },
      take: limit,
      orderBy: { nombre: "asc" },
    });

    // 3. Search Clients (Clientes)
    const clientesPromise = prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: "insensitive" } },
          { cedula: { contains: query, mode: "insensitive" } },
          { correo: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        nombre: true,
        cedula: true,
        correo: true,
      },
      take: limit,
      orderBy: { nombre: "asc" },
    });

    // Execute queries concurrently
    const [tickets, productos, clientes] = await Promise.all([
      ticketsPromise,
      productosPromise,
      clientesPromise,
    ]);

    return {
      tickets,
      productos,
      clientes,
    };
  }
}
