// Catálogo Inteligente de Dispositivos, Marcas, Modelos y Accesos Rápidos
// Inspirado en el diseño institucional de alto rendimiento SIRAC

export interface DeviceCategoryDef {
  id: string;
  label: string;
  popularBrands: string[];
  allBrands: string[];
}

export const DEVICE_CATEGORIES: DeviceCategoryDef[] = [
  {
    id: "Smartphone",
    label: "Smartphone",
    popularBrands: ["SAMSUNG", "APPLE", "XIAOMI", "TECNO", "INFINIX", "MOTOROLA"],
    allBrands: [
      "SAMSUNG",
      "APPLE",
      "XIAOMI",
      "TECNO",
      "INFINIX",
      "MOTOROLA",
      "HUAWEI",
      "HONOR",
      "OPPO",
      "REALME",
      "ZTE",
      "ALCATEL",
      "VIVO",
      "POCO",
      "BLU",
      "GOOGLE PIXEL",
      "ONEPLUS",
      "SONY XPERIA",
      "TCL",
      "NOKIA",
    ],
  },
  {
    id: "Tablet",
    label: "Tablet",
    popularBrands: ["APPLE", "SAMSUNG", "XIAOMI", "LENOVO", "AMAZON"],
    allBrands: [
      "APPLE",
      "SAMSUNG",
      "XIAOMI",
      "LENOVO",
      "AMAZON",
      "HUAWEI",
      "REALME",
      "ALCATEL",
      "CHUWI",
      "TECLAST",
      "BLACKVIEW",
    ],
  },
  {
    id: "Laptop",
    label: "Laptop",
    popularBrands: ["HP", "DELL", "LENOVO", "ASUS", "ACER", "APPLE"],
    allBrands: [
      "HP",
      "DELL",
      "LENOVO",
      "ASUS",
      "ACER",
      "APPLE",
      "MSI",
      "TOSHIBA",
      "SAMSUNG",
      "SONY VAIO",
      "HUAWEI",
      "GATEWAY",
      "COMPAQ",
      "ALIENWARE",
      "RAZER",
      "SIRAGON",
    ],
  },
  {
    id: "TV",
    label: "TV / Monitor",
    popularBrands: ["SAMSUNG", "LG", "SONY", "TCL", "HISENSE", "PHILIPS"],
    allBrands: [
      "SAMSUNG",
      "LG",
      "SONY",
      "TCL",
      "HISENSE",
      "PHILIPS",
      "AOC",
      "DAEWOO",
      "PANASONIC",
      "HYUNDAI",
      "XIAOMI",
      "RCA",
      "JVC",
      "VIEWSONIC",
      "BENQ",
      "SANKEY",
      "PREMIER",
      "CHALLENGER",
      "HAIER",
      "AIWA",
    ],
  },
  {
    id: "Consola",
    label: "Consola",
    popularBrands: ["SONY", "MICROSOFT", "NINTENDO", "VALVE", "ASUS"],
    allBrands: [
      "SONY",
      "MICROSOFT",
      "NINTENDO",
      "VALVE",
      "ASUS",
      "SEGA",
      "ATARI",
      "RETROID",
      "ANBERNIC",
      "AYANEO",
    ],
  },
  {
    id: "PC",
    label: "PC Escritorio",
    popularBrands: ["CLON / ENSAMBLADO", "ASUS", "HP", "DELL", "LENOVO", "MSI"],
    allBrands: [
      "CLON / ENSAMBLADO",
      "ASUS",
      "HP",
      "DELL",
      "LENOVO",
      "MSI",
      "GIGABYTE",
      "INTEL",
      "AMD",
      "CORSAIR",
      "ACER",
      "ASROCK",
      "EVGA",
      "NZXT",
    ],
  },
  {
    id: "Smartwatch",
    label: "Smartwatch",
    popularBrands: ["APPLE", "SAMSUNG", "GARMIN", "XIAOMI", "HUAWEI"],
    allBrands: [
      "APPLE",
      "SAMSUNG",
      "GARMIN",
      "XIAOMI",
      "HUAWEI",
      "AMAZFIT",
      "FITBIT",
      "FOSSIL",
      "POLAR",
      "SUUNTO",
      "HAYLOU",
      "ZEBLAZE",
    ],
  },
  {
    id: "Audio",
    label: "Corneta / Audio",
    popularBrands: ["JBL", "SONY", "BOSE", "HARMAN KARDON", "MARSHALL", "XIAOMI"],
    allBrands: [
      "JBL",
      "SONY",
      "BOSE",
      "HARMAN KARDON",
      "MARSHALL",
      "BEATS",
      "ANKER / SOUNDCORE",
      "AMAZON ECHO",
      "XIAOMI",
      "AIWA",
      "PANASONIC",
      "LOGITECH",
      "EDIFIER",
      "PIONEER",
      "TRONSMART",
      "B&O PLAY",
    ],
  },
  {
    id: "Otro",
    label: "Otro Dispositivo",
    popularBrands: ["GENÉRICO", "SONY", "SAMSUNG", "XIAOMI", "OTRA MARCA"],
    allBrands: ["GENÉRICO", "SONY", "SAMSUNG", "XIAOMI", "OTRA MARCA"],
  },
];

// Modelos populares por marca para auto-sugerencias
export const POPULAR_MODELS_BY_BRAND: Record<string, string[]> = {
  SAMSUNG: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy S23 Ultra",
    "Galaxy S23",
    "Galaxy S22",
    "Galaxy A55 5G",
    "Galaxy A54 5G",
    "Galaxy A34 5G",
    "Galaxy A25",
    "Galaxy A15",
    "Galaxy A14",
    "Galaxy A05s",
    "Galaxy A04",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy Note 20 Ultra",
  ],
  APPLE: [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13",
    "iPhone 12 Pro Max",
    "iPhone 12",
    "iPhone 11",
    "iPhone XR",
    "iPad Pro 11\"",
    "iPad Air 5",
    "iPad 10ma Gen",
    "MacBook Air M2",
    "MacBook Pro 14\"",
    "Apple Watch Series 9",
  ],
  TECNO: [
    "Spark 20 Pro+",
    "Spark 20 Pro",
    "Spark 20",
    "Spark 10 Pro",
    "Spark 10C",
    "Camon 30 Pro",
    "Camon 20 Pro",
    "Camon 19 Pro",
    "Camon 18P",
    "Pova 6 Pro",
    "Pova 5",
    "Pop 7",
    "Pop 8",
  ],
  INFINIX: [
    "Hot 40 Pro",
    "Hot 40",
    "Hot 30 Play",
    "Hot 30",
    "Note 40 Pro",
    "Note 30 Pro",
    "Note 30",
    "Smart 8",
    "Smart 7",
    "Zero 30 5G",
    "GT 20 Pro",
  ],
  XIAOMI: [
    "Redmi Note 13 Pro+",
    "Redmi Note 13 Pro",
    "Redmi Note 13",
    "Redmi Note 12 Pro",
    "Redmi Note 12",
    "Redmi 13C",
    "Redmi 12",
    "Redmi 10C",
    "Poco X6 Pro",
    "Poco X5 Pro",
    "Poco F5 Pro",
    "Poco M6 Pro",
  ],
  MOTOROLA: [
    "Moto G84 5G",
    "Moto G54 5G",
    "Moto G24 Power",
    "Moto G14",
    "Moto G23",
    "Moto G22",
    "Edge 40 Neo",
    "Edge 30 Fusion",
    "Moto E13",
    "Moto E22",
  ],
  JBL: [
    "Flip 6",
    "Flip 5",
    "Charge 5",
    "Charge 4",
    "Go 3",
    "Go 2",
    "Boombox 3",
    "Boombox 2",
    "PartyBox 110",
    "PartyBox 310",
    "Xtreme 3",
    "Xtreme 2",
    "Clip 4",
    "Pulse 5",
    "Tune 510BT",
  ],
  SONY: [
    "PlayStation 5 (Standard)",
    "PlayStation 5 (Digital)",
    "PlayStation 4 Pro",
    "PlayStation 4 Slim",
    "SRS-XB100 (Corneta)",
    "SRS-XB23",
    "Bravia 4K Smart TV",
    "WH-1000XM5 (Audífonos)",
  ],
  MICROSOFT: ["Xbox Series X", "Xbox Series S", "Xbox One X", "Xbox One S"],
  NINTENDO: ["Switch OLED", "Switch V2 (Estándar)", "Switch Lite"],
  LG: ["OLED C3 4K", "OLED B3", "UHD AI ThinQ 55\"", "Nanocell 50\"", "Smart TV 43\" FHD"],
  TCL: ["Google TV 4K 55\" Serie P", "Android TV 43\"", "Roku TV 32\"", "Mini LED Serie C"],
  HP: ["Pavilion 15", "Victus 15 Gaming", "Envy x360", "ProBook 450", "250 G8 / G9"],
  DELL: ["Inspiron 15 3000", "Latitude 5420", "Latitude 7490", "Vostro 3510", "XPS 13"],
  LENOVO: ["IdeaPad 3 15ITL6", "IdeaPad Gaming 3", "ThinkPad T14", "ThinkPad E14", "Yoga Slim 7"],
  ASUS: ["VivoBook 15", "TUF Gaming F15", "ROG Strix G16", "ZenBook 14 OLED"],
};

// Accesos Rápidos de Fallas Frecuentes (Presets + Dinámicos)
export const DEFAULT_FALLAS_FRECUENTES = [
  "No enciende / Muerto total",
  "Pantalla rota / Sin imagen / Touch no responde",
  "No carga / Pin de carga dañado o con juego",
  "Batería degradada / Se descarga rápido / Apagado repentino",
  "Mojado / Daño por líquido / Equipo sulfatado",
  "Sin señal de operadora / Falla de baseband o lector SIM",
  "Cámara no enfoca / Lente roto / Manchas oscuras",
  "Altavoz distorsionado / Auricular no se escucha",
  "Reinicio constante / En bucle de logo (Bootloop)",
  "Sobrecalentamiento excesivo / Falla térmica",
  "Wi-Fi o Bluetooth no activan / Desconectan solos",
  "Mantenimiento preventivo, limpieza profunda y cambio de pasta térmica",
];

// Accesos Rápidos de Observaciones Físicas y de Recepción
export const DEFAULT_OBSERVACIONES_FRECUENTES = [
  "Pantalla rayada con signos evidentes de uso",
  "Carcasa golpeada en esquinas / Desgaste severo",
  "Tapa trasera fisurada / Rota",
  "Faltan tornillos externos / Equipo ya manipulado previamente",
  "Lente de cámara astillado / Rayado",
  "Signos visibles de humedad o sulfatación en puerto de carga",
  "Se recibe sin bandeja SIM ni tarjeta MicroSD",
  "Buen estado estético general / Bien cuidado por el cliente",
  "Trae forro protector / Protector de vidrio roto",
  "Se recibe solo el equipo, sin cargador ni cables",
  "Botones físicos de volumen o encendido duros / atascados",
];

// ── Árbol de Fallas Progresivo en 2 Niveles (Tronco -> Ramas) ──
export interface FallaNodoDef {
  id: string;
  label: string;
  color: string;
  ramas: string[];
}

export const ARBOL_FALLAS: FallaNodoDef[] = [
  {
    id: "energia",
    label: "Energía & Carga",
    color: "amber",
    ramas: [
      "No enciende (Muerto)",
      "Batería degradada / Apagado repentino",
      "Pin de carga dañado / Con juego",
      "Calienta en exceso al cargar",
      "Corto en placa / Consumo anormal",
      "Carga lenta o intermitente",
    ],
  },
  {
    id: "pantalla",
    label: "Pantalla & Imagen",
    color: "blue",
    ramas: [
      "Vidrio roto / Astillado (Da imagen)",
      "Sin imagen / Pantalla negra total",
      "Touch no responde / Toques fantasma",
      "Líneas o manchas verdes / moradas",
      "Parpadeo / Pérdida de iluminación",
    ],
  },
  {
    id: "camaras",
    label: "Cámaras & Óptica",
    color: "violet",
    ramas: [
      "Cámara trasera no abre / En negro",
      "Cámara frontal borrosa / No enfoca",
      "Vidrio / Lente exterior quebrado",
      "Vibra o hace zumbido al enfocar (OIS)",
      "Flash / Linterna no dispara",
    ],
  },
  {
    id: "audio",
    label: "Audio & Comunicación",
    color: "teal",
    ramas: [
      "Altavoz distorsionado / Sin sonido",
      "Auricular de llamadas mudo",
      "Micrófono no envía audio / No me oyen",
      "Sin señal de operadora / Sin servicio",
      "Lector de SIM no detecta tarjeta",
    ],
  },
  {
    id: "humedad",
    label: "Humedad & Estructura",
    color: "cyan",
    ramas: [
      "Equipo mojado / Daño por líquido",
      "Sulfatación visible en componentes",
      "Tapa trasera rota / Fisurada",
      "Chasis doblado / Desalineado",
      "Botones volumen / power trabados",
      "Tornillos faltantes / Ya manipulado",
    ],
  },
  {
    id: "sistema",
    label: "Sistema & Software",
    color: "indigo",
    ramas: [
      "En bucle de logo (Bootloop)",
      "Reinicio constante cada pocos minutos",
      "Pide cuenta / Bloqueado por clave",
      "Memoria saturada / Sistema congelado",
      "Falla tras actualización de software",
    ],
  },
];

// Helper para obtener marcas relevantes por categoría
export function getBrandsForCategory(categoryId: string, dbBrands: { nombre: string }[] = []): {
  popular: string[];
  all: string[];
} {
  const cat = DEVICE_CATEGORIES.find((c) => c.id === categoryId) || DEVICE_CATEGORIES[0];

  // Marcas de la base de datos que coinciden con esta categoría o no están categorizadas como exclusivas de otra
  const dbBrandNames = dbBrands.map((b) => b.nombre.toUpperCase().trim());

  // Set unificado
  const popular = cat.popularBrands;
  const allSet = new Set<string>([...cat.allBrands]);

  // Si hay marcas en la BD que concuerdan o que el usuario agregó para esta categoría, incluirlas
  dbBrandNames.forEach((name) => {
    // Si la marca pertenece expresamente a otra categoría incompatible, no mezclarla
    const isOtherExclusive = isBrandExclusiveToOtherCategory(name, cat.id);
    if (!isOtherExclusive) {
      allSet.add(name);
    }
  });

  return {
    popular,
    all: Array.from(allSet).sort((a, b) => a.localeCompare(b)),
  };
}

// Verifica si una marca pertenece exclusivamente a otra categoría para no sobrepoblar (ej. JBL en Smartphone)
function isBrandExclusiveToOtherCategory(brandName: string, currentCategoryId: string): boolean {
  const b = brandName.toUpperCase().trim();

  // JBL, BOSE, MARSHALL, HARMAN KARDON, EDIFIER son típicamente Audio
  const isAudioExclusive = ["JBL", "BOSE", "MARSHALL", "HARMAN KARDON", "EDIFIER", "BEATS", "TRONSMART"].includes(b);
  if (isAudioExclusive && currentCategoryId !== "Audio" && currentCategoryId !== "Otro") {
    return true;
  }

  // TECNO, INFINIX, MOTOROLA, POCO son típicamente Smartphones
  const isPhoneExclusive = ["TECNO", "INFINIX", "MOTOROLA", "POCO", "BLU", "ONEPLUS", "VIVO", "OPPO", "REALME"].includes(b);
  if (isPhoneExclusive && ["TV", "Audio", "Consola", "PC"].includes(currentCategoryId)) {
    return true;
  }

  // NINTENDO es Consola
  if (b === "NINTENDO" && currentCategoryId !== "Consola" && currentCategoryId !== "Otro") {
    return true;
  }

  return false;
}

// ── Checklist Contextual por Categoría de Dispositivo ──

export interface ChecklistGroupDef {
  titulo: string;
  color: string;
  items: {
    key: string;
    label: string;
  }[];
}

export function getChecklistForCategory(categoryId: string): ChecklistGroupDef[] {
  if (categoryId === "TV") {
    return [
      {
        titulo: "Panel Display & Imagen",
        color: "blue",
        items: [
          { key: "encendido", label: "Enciende / Luz Standby funcional" },
          { key: "pantalla_fallas_internas", label: "Panel sin líneas, manchas ni golpes" },
          { key: "touch", label: "Iluminación Backlight / LEDs parejos" },
        ],
      },
      {
        titulo: "Entradas & Conectividad",
        color: "indigo",
        items: [
          { key: "conectividad_wifi_bt", label: "Puertos HDMI y USB operativos" },
          { key: "senal", label: "Sintonizador de antena / Coaxial funcional" },
          { key: "puerto_carga", label: "Cable de corriente / Conector de poder firme" },
        ],
      },
      {
        titulo: "Audio & Controles",
        color: "violet",
        items: [
          { key: "audio", label: "Altavoces internos nítidos sin saturar" },
          { key: "botones", label: "Botonera física / Sensor infrarrojo del control" },
        ],
      },
      {
        titulo: "Estado Físico & Montaje",
        color: "gray",
        items: [
          { key: "carcasa_rota", label: "Bisel o carcasa trasera sin roturas" },
          { key: "tornilleria_faltante", label: "Base de mesa o tornillos de soporte presentes" },
          { key: "uso_diario_desgaste", label: "Desgaste estético por uso diario" },
        ],
      },
    ];
  }

  if (categoryId === "Audio") {
    return [
      {
        titulo: "Energía & Batería",
        color: "green",
        items: [
          { key: "encendido", label: "Enciende y emite tono de inicio" },
          { key: "bateria", label: "Batería retiene carga adecuadamente" },
          { key: "puerto_carga", label: "Puerto de carga firme (Type-C / MicroUSB)" },
        ],
      },
      {
        titulo: "Conectividad Inalámbrica & Aux",
        color: "indigo",
        items: [
          { key: "conectividad_wifi_bt", label: "Bluetooth empareja y no se corta" },
          { key: "senal", label: "Entrada Auxiliar 3.5mm / Entrada USB" },
        ],
      },
      {
        titulo: "Acústica & Controles",
        color: "violet",
        items: [
          { key: "audio", label: "Audio claro / Sin distorsión en volumen máximo" },
          { key: "botones", label: "Botones de volumen, play y bluetooth responden" },
        ],
      },
      {
        titulo: "Carcasa & Estructura",
        color: "gray",
        items: [
          { key: "carcasa_rota", label: "Malla y chasis sin roturas ni fisuras" },
          { key: "accesorios_sim_sd", label: "Sellos de goma protectores presentes" },
          { key: "uso_diario_desgaste", label: "Signos de caídas, golpes o humedad" },
        ],
      },
    ];
  }

  if (categoryId === "Laptop" || categoryId === "PC") {
    return [
      {
        titulo: "Arranque & Video",
        color: "blue",
        items: [
          { key: "encendido", label: "Enciende y da POST / Video" },
          { key: "pantalla_fallas_internas", label: "Pantalla sin manchas ni bisagras dañadas" },
          { key: "touch", label: "Touchpad / Trackpad y clics operativos" },
        ],
      },
      {
        titulo: "Teclado, Puertos & Energía",
        color: "green",
        items: [
          { key: "botones", label: "Teclado completo responde" },
          { key: "puerto_carga", label: "Jack de carga / Alimentación firme" },
          { key: "bateria", label: "Batería retiene carga autónoma" },
          { key: "conectividad_wifi_bt", label: "Puertos USB, HDMI y Wi-Fi operativos" },
        ],
      },
      {
        titulo: "Multimedia & Térmica",
        color: "violet",
        items: [
          { key: "audio", label: "Altavoces y micrófono funcionales" },
          { key: "camaras", label: "Cámara web integrada operativa" },
          { key: "sensor_proximidad", label: "Ventilador / Disipador sin ruido anormal" },
        ],
      },
      {
        titulo: "Chasis & Tornillería",
        color: "gray",
        items: [
          { key: "carcasa_rota", label: "Carcasa o tapa sin roturas ni abolladuras" },
          { key: "tornilleria_faltante", label: "Tornillos completos de ensamblaje" },
          { key: "uso_diario_desgaste", label: "Desgaste exterior por uso" },
        ],
      },
    ];
  }

  if (categoryId === "Consola") {
    return [
      {
        titulo: "Encendido & Salida de Video",
        color: "blue",
        items: [
          { key: "encendido", label: "Enciende normal / Luz de estado correcta" },
          { key: "pantalla_fallas_internas", label: "Salida HDMI limpia sin glitches ni artifacts" },
          { key: "puerto_carga", label: "Puerto de poder / Cable AC firme" },
        ],
      },
      {
        titulo: "Conexión, Mandos & Juegos",
        color: "indigo",
        items: [
          { key: "conectividad_wifi_bt", label: "Sincroniza controles y conecta a Wi-Fi" },
          { key: "senal", label: "Lector de discos / Ranura de juegos operativa" },
          { key: "botones", label: "Botones físicos (Power / Eject / Sync)" },
        ],
      },
      {
        titulo: "Térmica, Audio & Chasis",
        color: "gray",
        items: [
          { key: "sensor_proximidad", label: "Ventilación silenciosa / Sin recalentamiento" },
          { key: "audio", label: "Audio por HDMI o salida óptica" },
          { key: "carcasa_rota", label: "Carcasa sin roturas / Rejillas limpias" },
          { key: "tornilleria_faltante", label: "Sellos de garantía / Tornillos presentes" },
        ],
      },
    ];
  }

  if (categoryId === "Smartwatch") {
    return [
      {
        titulo: "Pantalla & Táctil",
        color: "blue",
        items: [
          { key: "encendido", label: "Enciende correctamente" },
          { key: "touch", label: "Pantalla táctil responde en toda el área" },
          { key: "pantalla_fallas_internas", label: "Cristal sin fisuras ni manchas" },
        ],
      },
      {
        titulo: "Energía & Sensores",
        color: "green",
        items: [
          { key: "bateria", label: "Batería retiene carga" },
          { key: "puerto_carga", label: "Carga magnética / Pines operativos" },
          { key: "biometria", label: "Sensores ópticos de ritmo cardíaco" },
        ],
      },
      {
        titulo: "Conectividad & Físico",
        color: "pink",
        items: [
          { key: "conectividad_wifi_bt", label: "Bluetooth vincula con celular" },
          { key: "botones", label: "Corona giratoria y botones físicos" },
          { key: "accesorios_sim_sd", label: "Correa presente y seguros firmes" },
          { key: "carcasa_rota", label: "Caja o carcasa sin golpes severos" },
        ],
      },
    ];
  }

  // Por defecto: Smartphone, Tablet u Otro
  return [
    {
      titulo: "Pantalla & Visualización",
      color: "blue",
      items: [
        { key: "touch", label: "Touch / Digitalizador funcional" },
        { key: "pantalla_fallas_internas", label: "Pantalla con fallas internas / manchas" },
      ],
    },
    {
      titulo: "Energía & Encendido",
      color: "green",
      items: [
        { key: "encendido", label: "Enciende (Power / Boot)" },
        { key: "bateria", label: "Batería retiene carga" },
        { key: "puerto_carga", label: "Puerto de carga operativo" },
      ],
    },
    {
      titulo: "Conectividad & Sensores",
      color: "indigo",
      items: [
        { key: "senal", label: "Señal móvil / Antenas" },
        { key: "conectividad_wifi_bt", label: "Wi-Fi y Bluetooth" },
        { key: "biometria", label: "Biometría (Huella / FaceID)" },
        { key: "sensor_proximidad", label: "Sensor de proximidad" },
      ],
    },
    {
      titulo: "Multimedia & Botones",
      color: "violet",
      items: [
        { key: "camaras", label: "Cámaras (Frontal / Trasera)" },
        { key: "audio", label: "Audio (Altavoz / Auricular)" },
        { key: "botones", label: "Botones de volumen y power" },
        { key: "flash_linterna", label: "Flash / Linterna" },
      ],
    },
    {
      titulo: "Estado Físico & Accesorios",
      color: "gray",
      items: [
        { key: "carcasa_rota", label: "Carcasa o tapa rota" },
        { key: "tornilleria_faltante", label: "Tornillería faltante" },
        { key: "accesorios_sim_sd", label: "Bandeja SIM / MicroSD presente" },
        { key: "funda", label: "Trae funda / forro protector" },
        { key: "uso_diario_desgaste", label: "Desgaste por uso diario" },
      ],
    },
  ];
}

