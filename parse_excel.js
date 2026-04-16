const fs = require("fs");

const raw = JSON.parse(fs.readFileSync("data.json"));

// detectar tabla mensual
const meses = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

let facturacion = [];

raw.forEach(row => {
  const values = Object.values(row);

  const mes = values.find(v => meses.includes(v));
  if (!mes) return;

  const numeros = values
    .map(v => parseFloat((v || "").toString().replace(/[€,%]/g, "")))
    .filter(v => !isNaN(v));

  if (numeros.length > 2) {
    facturacion.push({
      mes,
      ingresos: numeros[2] || 0, // Real 2026
      coste: numeros[3] || 0
    });
  }
});

// KPIs globales
const totalIngresos = facturacion.reduce((a,b)=>a+b.ingresos,0);
const totalCoste = facturacion.reduce((a,b)=>a+b.coste,0);

fs.writeFileSync("bi_data.json", JSON.stringify({
  facturacion,
  totalIngresos,
  totalCoste,
  margen: totalIngresos - totalCoste
}, null, 2));

console.log("✅ BI data generado");
