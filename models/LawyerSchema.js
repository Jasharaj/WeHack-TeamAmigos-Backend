import mongoose from "mongoose";

const lawyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'lawyer' },
    licenseNumber: { type: String, required: true }, // Bar license number - mandatory for lawyers
    specialization: { type: String, required: true }, // Legal specialization
    yearsOfExperience: { type: Number, default: 0 }, // Years of experience
    casesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Case" }], // Cases assigned to the lawyer
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Lawyer", lawyerSchema);
