const fs = require("fs");

const raw = JSON.parse(fs.readFileSync("data.json"));

const keys = Object.keys(raw[0]);

const getKey = (possible) => {
  return keys.find(k =>
    possible.some(p => k.toLowerCase().includes(p))
  );
};

const fechaKey = getKey(["fecha", "date", "dia"]);
const ingresosKey = getKey(["ingres", "venta", "total"]);
const empleadoKey = getKey(["empleado", "camarero", "staff"]);
const actividadKey = getKey(["ticket", "servicio", "operac"]);

const data = raw.map(d => ({
  fecha: d[fechaKey],
  ingresos: Number(d[ingresosKey]) || 0,
  empleado: d[empleadoKey] || "N/A",
  actividad: Number(d[actividadKey]) || 0
}));

const totalIngresos = data.reduce((a,b)=>a+b.ingresos,0);
const totalActividad = data.reduce((a,b)=>a+b.actividad,0);

const fechas = data.map(d => d.fecha);
const ingresos = data.map(d => d.ingresos);

const empleadosMap = {};
data.forEach(d => {
  if (!empleadosMap[d.empleado]) {
    empleadosMap[d.empleado] = 0;
  }
  empleadosMap[d.empleado] += d.ingresos;
});

const empleados = Object.keys(empleadosMap);
const ingresosEmpleado = Object.values(empleadosMap);

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<h1>Dashboard</h1>

<h2>Total ingresos: €${totalIngresos.toFixed(2)}</h2>
<h2>Total actividad: ${totalActividad}</h2>

<canvas id="line"></canvas>
<canvas id="bar"></canvas>

<script>
new Chart(document.getElementById('line'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(fechas)},
    datasets: [{
      label: 'Ingresos',
      data: ${JSON.stringify(ingresos)}
    }]
  }
});

new Chart(document.getElementById('bar'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(empleados)},
    datasets: [{
      label: 'Ingresos por empleado',
      data: ${JSON.stringify(ingresosEmpleado)}
    }]
  }
});
</script>

</body>
</html>
`;

fs.writeFileSync("index.html", html);

console.log("✅ Dashboard generado");
