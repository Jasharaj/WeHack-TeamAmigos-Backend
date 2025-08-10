import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["draft", "final"], 
        default: "draft" 
    },
    reportType: { 
        type: String, 
        enum: ["case_summary", "legal_analysis", "client_report", "court_filing", "other"], 
        default: "other" 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'creatorModel',
        required: true 
    },
    creatorModel: {
        type: String,
        required: true,
        enum: ['Citizen', 'Lawyer']
    },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" }, // Optional case association
    caseName: { type: String }, // Optional case name for quick reference
    tags: [{ type: String }],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    sharedWith: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            refPath: 'userModel'
        },
        userModel: {
            type: String,
            enum: ['Citizen', 'Lawyer']
        },
        permissions: { 
            type: String, 
            enum: ["read", "edit"], 
            default: "read" 
        }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);
