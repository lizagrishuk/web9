import express from "express";
import cors from "cors";
import busboy from "busboy";
import zlib from "zlib";
import { promisify } from "util";

const app = express();
const gzipAsync = promisify(zlib.gzip);

app.use(cors());

app.get("/login", (req, res) => {
  res.type("text/plain");
  res.send("lizagrishuk");
});

// ВАЖНО: /zipper стоит ДО express.json/urlencoded
app.post("/zipper", (req, res) => {
  const contentType = req.headers["content-type"] || "";

  if (contentType.includes("multipart/form-data")) {
    let fileBuffer = null;

    const bb = busboy({ headers: req.headers });

    bb.on("file", (_name, file, _info) => {
      const chunks = [];

      file.on("data", (chunk) => {
        chunks.push(chunk);
      });

      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("field", (_name, val) => {
      if (fileBuffer === null) {
        fileBuffer = Buffer.from(val);
      }
    });

    bb.on("finish", async () => {
      try {
        const data = fileBuffer || Buffer.from("");
        const compressed = await gzipAsync(data);

        res.setHeader("Content-Type", "application/gzip");
        res.setHeader("Content-Disposition", "attachment; filename=result.gz");
        res.end(compressed);
      } catch (err) {
        res.status(500).send("Compression error");
      }
    });

    req.pipe(bb);
    return;
  }

  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("end", async () => {
    try {
      const data = Buffer.concat(chunks);
      const compressed = await gzipAsync(data);

      res.setHeader("Content-Type", "application/gzip");
      res.setHeader("Content-Disposition", "attachment; filename=result.gz");
      res.end(compressed);
    } catch (err) {
      res.status(500).send("Compression error");
    }
  });
});

// body-парсеры только ПОСЛЕ zipper
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
