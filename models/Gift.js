import mongoose from "mongoose";

export const GiftSchema = new mongoose.Schema({
  name: { type: String, required: true, min: 4, max: 64 },
  price: {
    type: Number,
    min: 100,
    default: 1000,
  },
  imageUrl: { type: String, min: 1024 },
  store: { type: Object ,
    name: { type: String, max: 254 },
    productURL: { type: String, max: 1024 },
    },
});

const Gifts = mongoose.model("Gift", GiftSchema);
export default Gifts;
