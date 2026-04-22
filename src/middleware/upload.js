import fs from "fs";
import path from "path";

import multer from "multer";

const uploadRoot = path.resolve("uploads/cards");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadRoot);
  },
  filename(_req, file, cb) {
    const extension = path.extname(file.originalname) || ".jpg";
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    cb(null, `${Date.now()}-${baseName || "image"}${extension}`);
  }
});

export const upload = multer({ storage });
