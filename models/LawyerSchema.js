import mongoose from "mongoose";

const lawyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'lawyer' },
    // barId: { type: String, required: true }, // Mandatory for lawyers
    // specialization: { type: String }, // Optional: Criminal, Civil, etc.
    casesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Case" }], // Cases assigned to the lawyer
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Lawyer", lawyerSchema);
