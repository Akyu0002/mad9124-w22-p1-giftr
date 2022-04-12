import mongoose from "mongoose";
import log from "./logger.js";

export default function () {
  mongoose
    .connect("mongodb://localhost:27017/mad9124", { useNewUrlParser: true })
    .then(() => {
      log.info("Successfully connected to MongoDB ...");
    })
    .catch((err) => {
      log.info("Error connecting to MongoDB ... ", err.message);
      process.exit(1);
    });
}
