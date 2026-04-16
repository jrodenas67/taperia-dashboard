import fs from "fs";

const raw = JSON.parse(fs.readFileSync("data.json"));

// meses válidos
const mesesLista = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

let facturacion = [];

raw.forEach(row => {
  const values = Object.values(row);

  // detectar mes
  const mes = values.find(v =>
    mesesLista.includes((v || "").toString().trim())
  );

  if (!mes) return;

  // limpiar números
  const numeros = values
    .map(v => {
      if (!v) return null;

      const limpio = v.toString()
        .replace(/[€,%\s]/g, "")
        .replace(",", ".");

      const num = parseFloat(limpio);
      return isNaN(num) ? null : num;
    })
    .filter(v => v !== null);

  if (numeros.length < 3) return;

  facturacion.push({
    mes,
    ingresos: numeros[2] || 0,
    coste: numeros[3] || 0
  });
});

// evitar crash si no hay datos
if (facturacion.length === 0) {
  console.error("❌ No se detectaron datos de facturación");
  fs.writeFileSync("bi_data.json", JSON.stringify({
    facturacion: [],
    totalIngresos: 0,
    totalCoste: 0,
    margen: 0
  }));
  process.exit(0);
}

const totalIngresos = facturacion.reduce((a,b)=>a+b.ingresos,0);
const totalCoste = facturacion.reduce((a,b)=>a+b.coste,0);

fs.writeFileSync("bi_data.json", JSON.stringify({
  facturacion,
  totalIngresos,
  totalCoste,
  margen: totalIngresos - totalCoste
}, null, 2));

console.log("✅ BI data generado correctamente");
