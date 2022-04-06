import mongoose from "mongoose";
import { giftSchema } from "./Gift.js";

const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, max: 254 },
    birthDate: { type: Date, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      //default: , // Not sure what to set this as for "Current User"
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    gifts: [giftSchema],
    imageUrl: { type: String, max: 1024 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
  // {
  //   // Adding timestamps will add the createdAt & updatedAt properties.
  //   timestamps: true,
  // }
);

const Model = mongoose.model("Person", personSchema);

export default Model;
