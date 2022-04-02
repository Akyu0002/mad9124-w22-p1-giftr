import mongoose from "mongoose";

const schema = new mongoose.Schema({
  username: { type: String, maxlength: 64, required: true },
  ipAddress: { type: String, maxlength: 64, required: true },
  didSucceed: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
});

const Model = mongoose.model("Authentication_attempts", schema);
export default Model;
