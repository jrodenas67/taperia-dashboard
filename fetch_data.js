import fs from "fs";
import fetch from "node-fetch";

const SHEET_URL = process.env.GOOGLE_SHEET_URL;

if (!SHEET_URL) {
  console.error("❌ GOOGLE_SHEET_URL no definida");
  process.exit(1);
}

try {
  const response = await fetch(SHEET_URL);

  if (!response.ok) {
    throw new Error(`Error descargando CSV: ${response.status}`);
  }

  const csvText = await response.text();

  const lines = csvText.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV vacío o sin datos");
  }

  const headers = lines[0].split(",").map(h => h.trim());

  const data = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());

    let row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return row;
  });

  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  console.log("✅ data.json actualizado correctamente");

} catch (error) {
  console.error("❌ Error en fetch_data.js:", error.message);
  process.exit(1);
}
