import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number.parseInt(process.env.PORT ?? "", 10) || 4173;
const distDir = path.resolve(__dirname, "../dist/public");
const indexFile = path.join(distDir, "index.html");

app.use(
  express.static(distDir, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-store");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(async (_req, res, next) => {
  try {
    await fs.access(indexFile);
    res.setHeader("Cache-Control", "no-store");
    res.sendFile(indexFile);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Production server error:", error);
  res.status(500).send("Internal Server Error");
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Kahoot Leaderboard running on http://localhost:${port}`);
  });
}

export default app;
