export type Producto = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  principio: string;
  especie: string;
};

export const CATEGORIAS = [
  "Antibióticos",
  "Antiparasitarios",
  "Antiinflamatorios",
  "Dermatología",
  "Digestivo",
  "Cardíaco",
  "Analgésicos",
  "Vacunas",
  "Suplementos",
];

export const FILTROS_PRECIO = [
  { value: "todos", label: "Todos los precios" },
  { value: "0-5000", label: "Hasta $5.000" },
  { value: "5001-10000", label: "$5.001 - $10.000" },
  { value: "10001-20000", label: "$10.001 - $20.000" },
  { value: "20001-mas", label: "Más de $20.000" },
];

// Catálogo base. Al primer ingreso se copia a localStorage ("admin-products"),
// que es donde se descuenta el stock y desde donde se leen los datos vigentes.
export const PRODUCTOS: Producto[] = [
  { id: "ME001", name: "Amoxibay 250mg", category: "Antibióticos", price: 4200, stock: 12, image: "Amoxibay.png", principio: "Amoxicilina — Blíster 10 comp.", especie: "Perro / Gato" },
  { id: "ME002", name: "Enrox 50mg", category: "Antibióticos", price: 6800, stock: 6, image: "enrrox.jpg", principio: "Enrofloxacino — Blíster 10 comp.", especie: "Perro / Gato" },
  { id: "ME003", name: "Metrobay 250mg", category: "Antibióticos", price: 3900, stock: 18, image: "Metrobay.jpg", principio: "Metronidazol — Blíster 10 comp.", especie: "Perro / Gato" },
  { id: "ME004", name: "Nexgard", category: "Antiparasitarios", price: 9500, stock: 9, image: "Nexgard.jpg", principio: "Afoxolaner — Masticable 1 unid.", especie: "Perro" },
  { id: "ME005", name: "Bravecto", category: "Antiparasitarios", price: 18900, stock: 25, image: "Bravecto.jpg", principio: "Fluralaner — Masticable 1 unid.", especie: "Perro" },
  { id: "ME006", name: "Revolution Plus", category: "Antiparasitarios", price: 14500, stock: 7, image: "RevolutionPlus.jpg", principio: "Selamectina + Sarolaner — Pipeta 1 unid.", especie: "Gato" },
  { id: "ME007", name: "Drontal Plus", category: "Antiparasitarios", price: 3200, stock: 14, image: "DrontalPlus.jpg", principio: "Praziquantel + Pamoato — Comprimido 1 unid.", especie: "Perro" },
  { id: "ME008", name: "Milbemax Gato", category: "Antiparasitarios", price: 6800, stock: 4, image: "MilbemaxGato.jpg", principio: "Milbemicina + Praziq. — Comprimido 2 unid.", especie: "Gato" },
  { id: "ME009", name: "Meloxicam 1mg", category: "Antiinflamatorios", price: 4500, stock: 20, image: "Metrobay.jpg", principio: "Meloxicam — Blíster 10 comp.", especie: "Perro / Gato" },
  { id: "ME010", name: "Carprofen 50mg", category: "Antiinflamatorios", price: 9800, stock: 8, image: "apoquel.jpg", principio: "Carprofeno — Blíster 10 comp.", especie: "Perro" },
  { id: "ME011", name: "Clorhexidina shampoo", category: "Dermatología", price: 8900, stock: 16, image: "Omeprazol.jpg", principio: "Clorhexidina 2% — Frasco 250ml", especie: "Perro / Gato" },
  { id: "ME012", name: "Malaseb shampoo", category: "Dermatología", price: 12500, stock: 10, image: "Tramadol.jpg", principio: "Miconazol + Clorhex. — Frasco 250ml", especie: "Perro / Gato" },
  { id: "ME013", name: "Apoquel 16mg", category: "Dermatología", price: 22000, stock: 5, image: "apoquel.jpg", principio: "Oclacitinib — Blíster 10 comp.", especie: "Perro" },
  { id: "ME014", name: "Probifor", category: "Digestivo", price: 5600, stock: 11, image: "probifor.jpg", principio: "Bacillus clausii — Sobre 5ml x10", especie: "Perro / Gato" },
  { id: "ME015", name: "Omeprazol 10mg vet", category: "Digestivo", price: 3800, stock: 8, image: "Omeprazol.jpg", principio: "Omeprazol — Blíster 10 comp.", especie: "Perro / Gato" },
  { id: "ME016", name: "Vetmedin 2.5mg", category: "Cardíaco", price: 28000, stock: 6, image: "Vetmedin.jpg", principio: "Pimobendan — Blíster 10 comp.", especie: "Perro" },
  { id: "ME017", name: "Tramadol 50mg vet", category: "Analgésicos", price: 5200, stock: 4, image: "Tramadol.jpg", principio: "Tramadol — Blíster 10 comp.", especie: "Perro" },
  { id: "ME018", name: "Nobivac DHPPi", category: "Vacunas", price: 8500, stock: 9, image: "NobivacDHPPi.jpg", principio: "Vacuna polivalente — Vial 1 dosis", especie: "Perro" },
  { id: "ME019", name: "Nobivac Rabies", category: "Vacunas", price: 5800, stock: 12, image: "NobivacRabies.jpg", principio: "Vacuna antirrábica — Vial 1 dosis", especie: "Perro / Gato" },
  { id: "ME020", name: "Felocell CVR", category: "Vacunas", price: 7200, stock: 15, image: "FelocellCVR.jpg", principio: "Vacuna triple felina — Vial 1 dosis", especie: "Gato" },
  { id: "ME021", name: "Omega vet 3-6-9", category: "Suplementos", price: 9900, stock: 10, image: "Omegavet 3-6-9.jpg", principio: "Ácidos grasos omega — Frasco 100ml", especie: "Perro / Gato" },
  { id: "ME022", name: "Condrovet forte", category: "Suplementos", price: 14500, stock: 13, image: "Condrovetforte.jpg", principio: "Condroitín + Glucos. — Blíster 30 comp.", especie: "Perro" },
];

export const DESTACADOS = ["ME001", "ME002", "ME003", "ME004"];

export function imagenProducto(file: string) {
  return file ? `/img/${encodeURI(file)}` : "";
}
