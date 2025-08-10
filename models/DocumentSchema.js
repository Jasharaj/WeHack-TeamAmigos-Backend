import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { 
        type: String, 
        enum: ["contract", "evidence", "court", "identification", "other"], 
        required: true 
    },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true }, // Cloudinary URL
    cloudinaryPublicId: { type: String }, // Cloudinary public ID for management
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    tags: [{ type: String }],
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'uploaderModel',
        required: true 
    },
    uploaderModel: {
        type: String,
        required: true,
        enum: ['Citizen', 'Lawyer']
    },
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" }, // Optional case association
    shareSettings: {
        isPublic: { type: Boolean, default: false },
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
        shareableLink: { type: String } // Optional public sharing link
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Document", documentSchema);
