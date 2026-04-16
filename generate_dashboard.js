const fs = require("fs");

// 📥 Leer datos BI
const data = JSON.parse(fs.readFileSync("bi_data.json"));

// 📊 Datos
const meses = data.facturacion.map(d => d.mes);
const ingresos = data.facturacion.map(d => d.ingresos);
const costes = data.facturacion.map(d => d.coste);

// 📈 KPIs
const totalIngresos = data.totalIngresos || 0;
const totalCoste = data.totalCoste || 0;
const margen = data.margen || 0;

const ratio = totalIngresos > 0
  ? (totalCoste / totalIngresos * 100)
  : 0;

// 🎨 color semáforo
const getColor = (value) => {
  if (value > 40) return "#ef4444";   // rojo
  if (value > 35) return "#f59e0b";   // naranja
  return "#22c55e";                   // verde
};

// 🧠 DIAGNÓSTICO INTELIGENTE
let diagnostico = [];
let recomendaciones = [];

// COSTE
if (ratio > 40) {
  diagnostico.push("🔴 Coste de personal excesivo");
  recomendaciones.push("Reducir personal en días de baja demanda (miércoles/jueves)");
} else if (ratio > 35) {
  diagnostico.push("🟡 Coste controlado pero mejorable");
  recomendaciones.push("Optimizar turnos para bajar del 35%");
} else {
  diagnostico.push("🟢 Coste bien optimizado");
}

// INGRESOS (tendencia)
if (ingresos.length > 2) {
  const ultimo = ingresos[ingresos.length - 1];
  const anterior = ingresos[ingresos.length - 2];

  if (ultimo < anterior * 0.8) {
    diagnostico.push("🔴 Caída fuerte de ingresos");
    recomendaciones.push("Revisar eventos, clima o staffing reciente");
  } else if (ultimo < anterior) {
    diagnostico.push("🟡 Ligera caída de ingresos");
    recomendaciones.push("Monitorizar próximos días");
  } else {
    diagnostico.push("🟢 Tendencia positiva");
  }
}

// MARGEN
if (margen < totalIngresos * 0.5) {
  diagnostico.push("🟡 Margen ajustado");
  recomendaciones.push("Revisar costes fijos y estructura");
} else {
  diagnostico.push("🟢 Margen saludable");
}

// ALERTA GENERAL
let alerta = "✅ Operativa estable";

if (ratio > 40) alerta = "⚠️ Coste alto";
if (ingresos.length > 1 && ingresos[ingresos.length - 1] < ingresos[ingresos.length - 2]) {
  alerta = "📉 Bajada reciente de ingresos";
}

// 📊 HTML
const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dashboard BI Tapería</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body {
  font-family: Arial;
  background: #0f172a;
  color: white;
  margin: 0;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
}

.alert {
  font-weight: bold;
  color: #f87171;
}

ul {
  padding-left: 20px;
}

canvas {
  margin-top: 30px;
  background: white;
  border-radius: 10px;
  padding: 10px;
}
</style>

</head>
<body>

<h1>📊 Dashboard BI — Tapería Caldes</h1>

<div class="grid">

  <div class="card">
    <h3>💰 Ingresos</h3>
    <h2>€${totalIngresos.toFixed(2)}</h2>
  </div>

  <div class="card">
    <h3>💸 Coste Personal</h3>
    <h2>€${totalCoste.toFixed(2)}</h2>
  </div>

  <div class="card">
    <h3>📈 Margen</h3>
    <h2>€${margen.toFixed(2)}</h2>
  </div>

  <div class="card">
    <h3>⚖️ Ratio</h3>
    <h2 style="color:${getColor(ratio)}">${ratio.toFixed(1)}%</h2>
  </div>

</div>

<div class="card">
  <h3>⚠️ Estado</h3>
  <div class="alert">${alerta}</div>
</div>

<div class="card">
  <h3>🧠 Diagnóstico</h3>
  <ul>
    ${diagnostico.map(d => `<li>${d}</li>`).join("")}
  </ul>
</div>

<div class="card">
  <h3>📋 Recomendaciones</h3>
  <ul>
    ${recomendaciones.map(r => `<li>${r}</li>`).join("")}
  </ul>
</div>

<canvas id="lineChart"></canvas>
<canvas id="barChart"></canvas>

<script>

new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(meses)},
    datasets: [
      {
        label: 'Ingresos',
        data: ${JSON.stringify(ingresos)},
        borderWidth: 2
      },
      {
        label: 'Coste',
        data: ${JSON.stringify(costes)},
        borderWidth: 2
      }
    ]
  }
});

new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(meses)},
    datasets: [{
      label: 'Margen',
      data: ${JSON.stringify(ingresos.map((v,i)=>v - (costes[i]||0)))}
    }]
  }
});

</script>

</body>
</html>
`;

// 💾 Guardar
fs.writeFileSync("index.html", html);

console.log("✅ Dashboard BI modo consultor generado");
