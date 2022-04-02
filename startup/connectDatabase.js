import mongoose from "mongoose";
import createDebug from "debug";

export default function () {
  mongoose
    .connect("mongodb://localhost:27017/mad9124", { useNewUrlParser: true })
    .then(() => {
      console.log("Successfully connected to MongoDB ...");
    })
    .catch((err) => {
      console.log("Error connecting to MongoDB ... ", err.message);
      process.exit(1);
    });
}
