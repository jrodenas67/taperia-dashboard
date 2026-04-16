if (!process.env.GOOGLE_SHEET_URL) {
  console.error("❌ GOOGLE_SHEET_URL no definida");
  process.exit(1);
}const fs = require("fs");
const https = require("https");

const SHEET_URL = process.env.GOOGLE_SHEET_URL;

https.get(SHEET_URL, (res) => {
  let data = "";

  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const rows = data.split("\n").map(r => r.split(","));

    const headers = rows[0];
    const json = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h.trim()] = row[i]);
      return obj;
    });

    fs.writeFileSync("data.json", JSON.stringify(json, null, 2));
    console.log("✅ data.json actualizado");
  });
});
