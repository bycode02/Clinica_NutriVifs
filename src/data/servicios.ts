export type Servicio = {
  code: string;
  name: string;
  description: string;
  image: string;
  alt: string;
  species: string;
  duration: string;
  price: string;
  observation: string;
  // Valor que se envía a /agendar?consulta=...
  consulta: string;
};

export type CategoriaServicios = {
  id: string;
  title: string;
  className: string;
  servicios: Servicio[];
};

export const CATEGORIAS_SERVICIOS: CategoriaServicios[] = [
  {
    id: "categoria-consultas",
    title: "🩺 Consultas",
    className: "categoria-servicios-1",
    servicios: [
      { code: "SV001", name: "Consulta general", description: "Revisión médica completa para evaluar el estado de salud de tu mascota.", image: "consulta-general.jpg", alt: "Consulta general veterinaria", species: "🐶🐱 Perro / Gato", duration: "30 min", price: "$15.000", observation: "Atención veterinaria general.", consulta: "Consulta general" },
      { code: "SV002", name: "Consulta de urgencia", description: "Atención veterinaria para situaciones que requieren atención inmediata.", image: "consulta-urgencia.jpg", alt: "Consulta de urgencia veterinaria", species: "🐶🐱 Perro / Gato", duration: "30 min", price: "$25.000", observation: "Fuera de horario +$10.000.", consulta: "Consulta de urgencia" },
      { code: "SV003", name: "Control postoperatorio", description: "Seguimiento médico después de una intervención quirúrgica.", image: "Control-postoperatorio.jpg", alt: "Control postoperatorio", species: "🐶🐱 Perro / Gato", duration: "20 min", price: "$10.000", observation: "Control y seguimiento de recuperación.", consulta: "Control postoperatorio" },
      { code: "SV004", name: "Consulta ave / conejo", description: "Atención veterinaria especializada para aves y conejos.", image: "Consulta-conejo.jpg", alt: "Consulta para aves y conejos", species: "🐦🐰 Ave / Conejo", duration: "30 min", price: "$18.000", observation: "Atención para animales pequeños.", consulta: "Consulta ave / conejo" },
      { code: "SV005", name: "Segunda opinión médica", description: "Evaluación adicional de un diagnóstico o tratamiento veterinario.", image: "evaluacion.jpg", alt: "Segunda opinión médica", species: "🐾 Todas", duration: "40 min", price: "$20.000", observation: "Requiere ficha previa.", consulta: "Segunda opinión médica" },
    ],
  },
  {
    id: "categoria-vacunacion",
    title: "💉 Vacunación",
    className: "categoria-servicios",
    servicios: [
      { code: "VA001", name: "Vacuna antirrábica canina", description: "Vacunación contra la rabia para perros.", image: "Vacuna-antirrábica.png", alt: "Vacuna antirrábica canina", species: "🐶 Perro", duration: "10 min", price: "$12.000", observation: "Obligatoria por ley.", consulta: "antirrabica-canina" },
      { code: "VA002", name: "Vacuna séxtuple canina", description: "Protección preventiva contra diferentes enfermedades caninas.", image: "Vacuna-séxtuple.jpg", alt: "Vacuna séxtuple canina", species: "🐶 Perro", duration: "10 min", price: "$18.000", observation: "Refuerzo anual.", consulta: "sextuple-canina" },
      { code: "VA003", name: "Vacuna bivalente felina", description: "Protección preventiva para gatos.", image: "Vacuna-bivalente.jpg", alt: "Vacuna bivalente felina", species: "🐱 Gato", duration: "10 min", price: "$15.000", observation: "Refuerzo anual.", consulta: "bivalente-felina" },
      { code: "VA004", name: "Vacuna triple felina", description: "Protección preventiva mediante vacunación para gatos.", image: "Vacuna-triple.jpg", alt: "Vacuna triple felina", species: "🐱 Gato", duration: "10 min", price: "$17.000", observation: "Refuerzo anual.", consulta: "triple-felina" },
      { code: "VA005", name: "Vacuna Bordetella canina", description: "Prevención de enfermedades respiratorias en perros.", image: "Vacuna-Bordetella.jpg", alt: "Vacuna Bordetella canina", species: "🐶 Perro", duration: "10 min", price: "$14.000", observation: "Tos de las perreras.", consulta: "bordetella-canina" },
      { code: "VA006", name: "Vacuna antirrábica felina", description: "Vacunación contra la rabia para gatos.", image: "antirrabica.png", alt: "Vacuna antirrábica felina", species: "🐱 Gato", duration: "10 min", price: "$12.000", observation: "Protección preventiva.", consulta: "antirrabica-felina" },
    ],
  },
  {
    id: "categoria-cirugia",
    title: "🏥 Cirugías",
    className: "categoria-servicios",
    servicios: [
      { code: "CI001", name: "Esterilización hembra canina", description: "Procedimiento de esterilización para hembras caninas.", image: "Esterilización-hembra.jpg", alt: "Esterilización hembra canina", species: "🐶 Perra", duration: "90 min", price: "$80.000", observation: "Incluye anestesia y hospitalización 24h.", consulta: "Esterilización hembra canina" },
      { code: "CI002", name: "Esterilización macho canino", description: "Procedimiento de esterilización para perros machos.", image: "esterilizacion-perro.jpg", alt: "Esterilización macho canino", species: "🐶 Perro", duration: "60 min", price: "$60.000", observation: "Incluye anestesia.", consulta: "Esterilización macho canino" },
      { code: "CI003", name: "Esterilización hembra felina", description: "Procedimiento de esterilización para gatas.", image: "castracion-gato.jpg", alt: "Esterilización hembra felina", species: "🐱 Gata", duration: "60 min", price: "$65.000", observation: "Incluye anestesia y hospitalización 12h.", consulta: "Esterilización hembra felina" },
      { code: "CI004", name: "Esterilización macho felino", description: "Procedimiento de esterilización para gatos machos.", image: "Esterilización-gatoHjpg.jpg", alt: "Esterilización macho felino", species: "🐱 Gato", duration: "45 min", price: "$50.000", observation: "Incluye anestesia.", consulta: "Esterilización macho felino" },
      { code: "CI005", name: "Extirpación de tumor cutáneo", description: "Procedimiento quirúrgico para retirar tumores cutáneos.", image: "extirpacion_cancer.jpg", alt: "Extirpación de tumor cutáneo", species: "🐶🐱 Perro / Gato", duration: "60 min", price: "$120.000", observation: "Precio referencial; varía según tamaño.", consulta: "Extirpación de tumor cutáneo" },
      { code: "CI006", name: "Cesárea de urgencia", description: "Procedimiento quirúrgico de emergencia para hembras gestantes.", image: "cesarea.jpg", alt: "Cesárea de urgencia", species: "🐶🐱 Perra / Gata", duration: "120 min", price: "$180.000", observation: "Atención de urgencia.", consulta: "Cesárea de urgencia" },
    ],
  },
  {
    id: "categoria-desparasitacion",
    title: "🪱 Desparasitación",
    className: "categoria-servicios",
    servicios: [
      { code: "DE001", name: "Desparasitación interna pequeños", description: "Tratamiento antiparasitario para perros pequeños de menos de 10 kg.", image: "DrontalPlus.jpg", alt: "Desparasitación interna pequeños", species: "🐶 Perro", duration: "5 min", price: "$8.000", observation: "Menos de 10 kg.", consulta: "Desparasitación interna pequeños" },
      { code: "DE002", name: "Desparasitación interna medianos", description: "Tratamiento antiparasitario para perros de peso mediano.", image: "DrontalPlus.jpg", alt: "Desparasitación interna medianos", species: "🐶 Perro", duration: "5 min", price: "$9.500", observation: "Entre 10 y 25 kg.", consulta: "Desparasitación interna medianos" },
      { code: "DE003", name: "Desparasitación interna grandes", description: "Tratamiento antiparasitario para perros de gran tamaño.", image: "DrontalPlus.jpg", alt: "Desparasitación interna grandes", species: "🐶 Perro", duration: "5 min", price: "$11.000", observation: "Más de 25 kg.", consulta: "Desparasitación interna grandes" },
      { code: "DE004", name: "Desparasitación interna felina", description: "Tratamiento antiparasitario interno para gatos.", image: "DrontalPlus.jpg", alt: "Desparasitación interna felina", species: "🐱 Gato", duration: "5 min", price: "$8.000", observation: "Aplicación según peso.", consulta: "Desparasitación interna felina" },
      { code: "DE005", name: "Antiparasitario externo", description: "Aplicación de pipeta para el control de parásitos externos.", image: "Bravecto.jpg", alt: "Antiparasitario externo", species: "🐶🐱 Perro / Gato", duration: "5 min", price: "$7.500", observation: "Incluye aplicación.", consulta: "Antiparasitario externo (pipeta)" },
    ],
  },
  {
    id: "categoria-examenes",
    title: "🔬 Exámenes",
    className: "categoria-servicios",
    servicios: [
      { code: "EX001", name: "Hemograma completo", description: "Análisis de sangre para evaluar el estado general de salud.", image: "hemograma.jpg", alt: "Hemograma completo", species: "🐶🐱 Perro / Gato", duration: "30 min", price: "$22.000", observation: "Resultado en 24-48 h.", consulta: "Hemograma completo" },
      { code: "EX002", name: "Perfil bioquímico completo", description: "Evaluación de parámetros bioquímicos importantes para la salud.", image: "perfill-bioquimico.jpg", alt: "Perfil bioquímico completo", species: "🐶🐱 Perro / Gato", duration: "30 min", price: "$35.000", observation: "Resultado en 24-48 h.", consulta: "Perfil bioquímico completo" },
      { code: "EX003", name: "Radiografía", description: "Estudio radiográfico para apoyar el diagnóstico veterinario.", image: "Radiografía.jpg", alt: "Radiografía", species: "🐶🐱 Perro / Gato", duration: "20 min", price: "$28.000", observation: "1 proyección.", consulta: "Radiografía (1 proyección)" },
      { code: "EX004", name: "Ecografía abdominal", description: "Evaluación mediante imagen de órganos y estructuras abdominales.", image: "ecografia.jpg", alt: "Ecografía abdominal", species: "🐶🐱 Perro / Gato", duration: "30 min", price: "$45.000", observation: "Examen abdominal.", consulta: "Ecografía abdominal" },
      { code: "EX005", name: "Test de leishmaniasis", description: "Prueba diagnóstica para detectar leishmaniasis en perros.", image: "leishmaniasis.jpg", alt: "Test de leishmaniasis", species: "🐶 Perro", duration: "15 min", price: "$18.000", observation: "Prueba rápida.", consulta: "Test de leishmaniasis" },
    ],
  },
];
