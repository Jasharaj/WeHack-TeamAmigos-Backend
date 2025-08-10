import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    priority: { 
        type: String, 
        enum: ["high", "medium", "low"], 
        default: "medium" 
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'userModel',
        required: true 
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Citizen', 'Lawyer']
    },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" }, // Optional case association
    caseName: { type: String }, // Optional case name for quick reference
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Reminder", reminderSchema);
