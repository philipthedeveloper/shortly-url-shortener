import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import yup from "yup";
import { nanoid } from "nanoid";
import { config } from "dotenv";
import connectDB from "./connection/mongodb.js";
import Url from "./model/Url.js";

config();

const app = express();

app.use(helmet());
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("static"));

// app.get("/url/:id", (req, res) => {
//   // TODO: get a short url by id
// });

app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const { url } = await Url.findOne({ slug });
    if (url) {
      return res.redirect(url);
    }
    return res.redirect(`/?error=${encodeURIComponent(`${slug} not found`)}`);
  } catch (error) {
    return res.redirect(`/?error=${encodeURIComponent(`Link not found`)}`);
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.post("/url", async (req, res, next) => {
  console.log(req.body);
  let { slug, url } = req.body;
  try {
    await schema.validate({ slug, url });
    if (!slug) {
      slug = nanoid(9);
    }
    slug = slug.toLowerCase();
    const newUrl = { url, slug };
    const createdUrl = await Url.create(newUrl);
    res.status(201).json(createdUrl);
  } catch (err) {
    if (err && err.code === 11000) {
      let keys = Object.keys(err.keyValue).join(", ");
      (err.message = `${keys} in use. 🍔`), (err.status = 409);
    }
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status);
  } else {
    res.status(500);
  }
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🍰" : err.stack,
  });
});

const PORT = process.env.PORT || 3030;

connectDB(() => {
  app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}`);
  });
});
