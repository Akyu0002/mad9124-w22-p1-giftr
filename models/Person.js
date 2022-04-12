import mongoose from "mongoose";
import { GiftSchema } from "../models/Gift.js";

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, max: 254 },
    birthDate: { type: Date, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    gifts: [GiftSchema],
    imageUrl: { type: String, max: 1024 },
  },
  {
    // Adding timestamps will add the createdAt & updatedAt properties.
    timestamps: true,
  }
);

const Model = mongoose.model("Person", personSchema);

export default Model;
