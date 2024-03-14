import { Schema, model } from "mongoose";

const UrlSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      require: true,
    },
    expireAt: { type: Date, default: Date.now, index: { expires: "24h" } },
  },
  { timestamps: true }
);

export default model("Urls", UrlSchema);
