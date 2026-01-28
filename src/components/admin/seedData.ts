import type { Status } from "@/components/dashboard/StatusBadge";

export interface SeedClient {
  name: string;
  status: Status;
  email: string;
  phone: string;
  address: string;
  contact_name: string;
  project_type: string;
  work_description: string;
  budget: string;
  project_dates: string;
  project_manager: string;
  pending_tasks: string;
  incidents: string;
  last_contact: string;
}

export const seedClients: SeedClient[] = [
  {
    name: "Familia Martínez - Chalet Pozuelo",
    status: "green",
    email: "jmartinez@gmail.com",
    phone: "+34 612 334 455",
    address: "C/ Los Pinos 24, Pozuelo de Alarcón",
    contact_name: "Jorge Martínez",
    project_type: "Cambio de ventanas completo",
    work_description: "Sustitución de 8 ventanas de aluminio con RPT en vivienda unifamiliar. Incluye 6 oscilobatientes (120x140cm) y 2 fijas (80x60cm). Color RAL 7016 antracita. Vidrio bajo emisivo 4/16/4.",
    budget: "Total: 6.200€ | Señal: 2.000€ (pagada) | Pendiente: 4.200€",
    project_dates: "Medición: 15/01 ✓ | Fabricación: 20/01–05/02 ✓ | Instalación: 12/02",
    project_manager: "Pedro",
    pending_tasks: "Confirmar hora instalación con cliente, preparar material auxiliar",
    incidents: "",
    last_contact: "08/02 – WhatsApp confirmando cita instalación. Todo OK."
  },
  {
    name: "Comunidad Edificio Goya 45",
    status: "yellow",
    email: "admfincas.goya@fincas.es",
    phone: "+34 915 667 788",
    address: "C/ Goya 45, Madrid",
    contact_name: "Administrador - Luis Fernández",
    project_type: "Renovación ventanas zonas comunes",
    work_description: "Cambio de 12 ventanas en portal, escalera y cuarto de contadores. Aluminio lacado blanco. Vidrio 4/12/4 climalit. Incluye retirada de carpintería antigua y remates de albañilería.",
    budget: "Total: 8.900€ | Señal: 3.000€ (pagada) | Pendiente: 5.900€",
    project_dates: "Medición: 10/01 ✓ | Fabricación: 25/01–15/02 | Instalación: 22–24/02",
    project_manager: "María",
    pending_tasks: "Confirmar con portero horarios, pedir permiso Ayuntamiento para contenedor",
    incidents: "Junta vecinos pidió cambio de color (de gris a blanco) después de firmar presupuesto",
    last_contact: "05/02 – Reunión con presidente comunidad. Aceptan nuevo color."
  },
  {
    name: "Bar Restaurante El Ancla",
    status: "red",
    email: "direccion@elancla.com",
    phone: "+34 623 445 566",
    address: "Paseo Marítimo 12, Getafe",
    contact_name: "Antonio Ruiz",
    project_type: "Cerramiento terraza hostelería",
    work_description: "Cerramiento de terraza 6x4m con cortinas de cristal plegables (6 hojas). Sistema sin perfilería inferior. Incluye toldos motorizados y canalón de recogida de aguas.",
    budget: "Total: 12.500€ | Señal: 4.000€ (pagada) | Pendiente: 8.500€",
    project_dates: "Medición: 05/01 ✓ | Fabricación: 15/01–10/02 | Instalación: PENDIENTE",
    project_manager: "Pedro",
    pending_tasks: "URGENTE: Resolver problema con licencia de terraza, reprogramar instalación",
    incidents: "Ayuntamiento ha paralizado obra por falta de licencia. Cliente muy enfadado. Requiere llamada de dirección.",
    last_contact: "02/02 – Cliente llamó muy molesto. Prometimos solución esta semana."
  },
  {
    name: "Clínica Dental Sonrisas",
    status: "green",
    email: "gerencia@clinicasonrisas.com",
    phone: "+34 916 778 899",
    address: "Av. de la Constitución 88, Alcorcón",
    contact_name: "Dra. Elena Vidal",
    project_type: "Puerta automática entrada",
    work_description: "Instalación de puerta automática corredera de cristal templado 10mm con sensor de movimiento. Ancho paso 180cm. Incluye motor CAME y mando a distancia de emergencia.",
    budget: "Total: 3.800€ | PAGADO 100%",
    project_dates: "Medición: 20/01 ✓ | Fabricación: 01–08/02 ✓ | Instalación: 10/02 ✓",
    project_manager: "Carlos",
    pending_tasks: "Enviar factura final y certificado de instalación",
    incidents: "",
    last_contact: "10/02 – Instalación completada. Cliente muy satisfecha."
  },
  {
    name: "Vivienda Sr. González - Reforma integral",
    status: "orange",
    email: "rgonzalez.arq@outlook.es",
    phone: "+34 634 556 677",
    address: "C/ Alcalá 234, 5ºB, Madrid",
    contact_name: "Roberto González",
    project_type: "Ventanas + puerta balcón",
    work_description: "Reforma completa carpintería: 5 ventanas oscilobatientes y 1 puerta balconera corredera elevable. Aluminio RPT color negro mate. Persianas motorizadas con mando centralizado.",
    budget: "Total: 9.400€ | Señal: 3.500€ (pagada) | Pendiente: 5.900€",
    project_dates: "Medición: 12/01 ✓ | Fabricación: 01–20/02 | Instalación: 25–26/02",
    project_manager: "María",
    pending_tasks: "Coordinar con albañil del cliente, confirmar medidas hueco balconera",
    incidents: "Retraso de 5 días en fabricación por falta de stock de perfiles negros",
    last_contact: "06/02 – Llamada informando del retraso. Cliente comprensivo."
  },
  {
    name: "Colegio San José",
    status: "green",
    email: "mantenimiento@colegiosanjose.edu",
    phone: "+34 917 889 900",
    address: "C/ San Bernardo 56, Madrid",
    contact_name: "Javier Mora (Jefe Mantenimiento)",
    project_type: "Reparación ventanas aulas",
    work_description: "Reparación y ajuste de 15 ventanas en aulas de primaria. Cambio de herrajes rotos, sellado perimetral y ajuste de hojas. Sin cambio de vidrios.",
    budget: "Total: 1.850€ | PAGADO 100%",
    project_dates: "Medición: 18/01 ✓ | Reparación: 08/02 ✓ (sábado)",
    project_manager: "Carlos",
    pending_tasks: "Ninguna - trabajo completado",
    incidents: "",
    last_contact: "08/02 – Trabajo terminado en jornada de sábado según acordado."
  },
  {
    name: "Promoción Residencial Mirador",
    status: "yellow",
    email: "compras@constructoramirador.com",
    phone: "+34 918 990 011",
    address: "Urbanización Mirador, Parcela 7, Majadahonda",
    contact_name: "Patricia Sanz (Jefa de Compras)",
    project_type: "Suministro ventanas obra nueva (24 viviendas)",
    work_description: "Suministro de carpintería completa para promoción de 24 viviendas: 144 ventanas, 24 puertas balconeras, 48 persianas. Aluminio blanco RPT. Entrega por fases según planning obra.",
    budget: "Total: 89.000€ | Certificación 1: 25.000€ (pagada) | Certificación 2: 30.000€ (pendiente) | Resto según avance",
    project_dates: "Fase 1 (portal A): Entrega 01/03 | Fase 2 (portal B): Entrega 15/04 | Fase 3 (portal C): Entrega 01/06",
    project_manager: "Pedro",
    pending_tasks: "Cobrar certificación 2, confirmar fechas fase 1 con jefe de obra",
    incidents: "Constructora tiene retrasos en su planning. Posible aplazamiento de entregas.",
    last_contact: "04/02 – Reunión en obra. Confirman fase 1 en fecha."
  },
  {
    name: "Tienda Moda Elegance",
    status: "green",
    email: "tienda@modaelegance.es",
    phone: "+34 645 112 233",
    address: "C/ Gran Vía 67, bajo, Madrid",
    contact_name: "Marta Delgado",
    project_type: "Escaparate comercial",
    work_description: "Instalación de escaparate de cristal templado 12mm con puerta de acceso. Estructura de aluminio negro. Vinilo de seguridad antiimpacto. Iluminación LED perimetral incluida.",
    budget: "Total: 5.200€ | Señal: 2.000€ (pagada) | Pendiente: 3.200€",
    project_dates: "Medición: 22/01 ✓ | Fabricación: 05–15/02 ✓ | Instalación: 18/02 (nocturna)",
    project_manager: "María",
    pending_tasks: "Coordinar instalación nocturna (22:00-06:00), avisar a policía local",
    incidents: "",
    last_contact: "09/02 – WhatsApp confirmando instalación nocturna día 18."
  },
  {
    name: "Nave Industrial Logística Norte",
    status: "orange",
    email: "instalaciones@logisticanorte.com",
    phone: "+34 656 223 344",
    address: "Polígono Industrial Norte, Nave 12, Coslada",
    contact_name: "Fernando Blanco (Dir. Operaciones)",
    project_type: "Puertas seccionales industriales",
    work_description: "Suministro e instalación de 3 puertas seccionales industriales motorizadas (4x4m cada una). Panel sándwich 40mm. Mirillas de seguridad. Sistema de apertura por mando y por detector de camiones.",
    budget: "Total: 18.500€ | Señal: 6.000€ (pagada) | Pendiente: 12.500€",
    project_dates: "Medición: 08/01 ✓ | Fabricación: 20/01–28/02 | Instalación: 05–07/03",
    project_manager: "Pedro",
    pending_tasks: "Confirmar grúa para instalación, coordinar con empresa eléctrica cliente",
    incidents: "Proveedor de paneles ha subido precio 8%. Negociando absorber parte del coste.",
    last_contact: "07/02 – Llamada informando situación precios. Pendiente respuesta."
  },
  {
    name: "Chalet Familia López-Durán",
    status: "red",
    email: "alopezduran@abogados.com",
    phone: "+34 667 334 455",
    address: "Urb. Los Robles, C/ Encina 8, Las Rozas",
    contact_name: "Alberto López-Durán",
    project_type: "Pérgola bioclimática + cerramiento",
    work_description: "Pérgola bioclimática 5x6m con lamas orientables motorizadas. Cerramiento lateral con cortinas de cristal. Iluminación LED integrada. Incluye toldo vertical motorizado.",
    budget: "Total: 22.000€ | Señal: 7.000€ (pagada) | Pendiente: 15.000€",
    project_dates: "Medición: 02/01 ✓ | Fabricación: 15/01–15/02 | Instalación: BLOQUEADA",
    project_manager: "María",
    pending_tasks: "URGENTE: Reunión con cliente para resolver disputa sobre acabados",
    incidents: "Cliente rechaza instalación porque el color de la pérgola no coincide exactamente con la muestra (diferencia de tono). Amenaza con reclamación legal. Dirección debe intervenir.",
    last_contact: "03/02 – Email formal del cliente exigiendo repetir fabricación o anular pedido."
  }
];
