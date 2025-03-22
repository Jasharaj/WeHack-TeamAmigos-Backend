import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    caseType: { type: String, enum: ["civil", "criminal", "family", "property", "consumer", "others"], required: true },
    status: { type: String, enum: ["rejected", "pending", "in progress", "resolved", "closed"], default: "pending" },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true }, // Linked citizen
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "Lawyer" }, // Assigned lawyer (optional initially)
    // hearings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hearing" }], // Associated hearings
    // documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }], // Related legal documents
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Case", caseSchema);
