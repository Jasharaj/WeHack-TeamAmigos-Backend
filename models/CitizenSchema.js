import mongoose from "mongoose";

const citizenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'citizen' },
    cases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Case" }], // Cases filed by the citizen
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Citizen", citizenSchema);
