const fs = require("fs");

// 📥 Leer datos procesados (BI)
const data = JSON.parse(fs.readFileSync("bi_data.json"));

// 📊 Datos para gráficos
const meses = data.facturacion.map(d => d.mes);
const ingresos = data.facturacion.map(d => d.ingresos);
const costes = data.facturacion.map(d => d.coste);

// 📈 KPIs
const totalIngresos = data.totalIngresos || 0;
const totalCoste = data.totalCoste || 0;
const margen = data.margen || 0;

// 🧠 cálculo ratio
const ratio = totalIngresos > 0 ? (totalCoste / totalIngresos * 100).toFixed(1) : 0;

// ⚠️ alertas simples
let alerta = "✅ Todo estable";

if (ratio > 40) {
  alerta = "⚠️ Coste de personal demasiado alto";
}

if (ingresos.length > 1 && ingresos[ingresos.length - 1] < ingresos[ingresos.length - 2]) {
  alerta = "📉 Caída de ingresos reciente";
}

// 🎨 HTML
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
  color: #f87171;
  font-weight: bold;
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
    <h3>⚖️ Ratio Coste</h3>
    <h2>${ratio}%</h2>
  </div>

</div>

<div class="card">
  <h3>⚠️ Alertas</h3>
  <div class="alert">${alerta}</div>
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

// 💾 guardar archivo final
fs.writeFileSync("index.html", html);

console.log("✅ Dashboard BI generado correctamente");
