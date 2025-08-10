import mongoose from "mongoose";

// Enhanced Dispute Schema for better integration
const disputeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Improved party management
    parties: {
        plaintiff: {
            id: { type: mongoose.Schema.Types.ObjectId, refPath: 'parties.plaintiff.type', required: true },
            name: { type: String, required: true },
            type: { type: String, enum: ['Citizen', 'Lawyer'], required: true },
            contactEmail: { type: String, required: true }
        },
        defendant: {
            id: { type: mongoose.Schema.Types.ObjectId, refPath: 'parties.defendant.type' },
            name: { type: String, required: true },
            type: { type: String, enum: ['Citizen', 'Lawyer', 'External'] },
            contactEmail: { type: String }
        }
    },
    
    // Enhanced status tracking
    status: { 
        type: String, 
        enum: [
            "draft",           // Being prepared
            "pending",         // Waiting for lawyer assignment
            "assigned",        // Lawyer assigned
            "mediation",       // In mediation process
            "negotiation",     // Direct negotiation
            "court-prep",      // Preparing for court
            "court-hearing",   // In court proceedings
            "resolved",        // Successfully resolved
            "dismissed",       // Case dismissed
            "withdrawn"        // Withdrawn by plaintiff
        ], 
        default: "draft" 
    },
    
    // Enhanced categorization
    category: { 
        type: String, 
        enum: ["civil", "criminal", "corporate", "family", "property", "contract", "employment", "intellectual-property"], 
        required: true 
    },
    
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    
    // Improved assignment system
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'createdByModel',
        required: true 
    },
    createdByModel: {
        type: String,
        required: true,
        enum: ['Citizen', 'Lawyer']
    },
    
    // Assigned lawyer with better tracking
    assignedLawyer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Lawyer"
    },
    assignmentDate: { type: Date },
    assignmentStatus: {
        type: String,
        enum: ["unassigned", "pending-acceptance", "accepted", "declined"],
        default: "unassigned"
    },
    
    // Case integration
    relatedCase: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Case" 
    },
    canCreateCase: { 
        type: Boolean, 
        default: false 
    }, // Can this dispute be escalated to a full case?
    
    // Timeline and scheduling
    nextHearing: { type: Date },
    hearingLocation: { type: String },
    hearingType: {
        type: String,
        enum: ["mediation", "arbitration", "court-hearing", "settlement-meeting"],
    },
    
    // Enhanced document management
    documents: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'documents.uploadedByModel' },
        uploadedByModel: { type: String, enum: ['Citizen', 'Lawyer'] },
        title: { type: String, required: true },
        type: {
            type: String,
            enum: ["evidence", "contract", "correspondence", "legal-brief", "settlement-offer", "other"]
        },
        shared: { type: Boolean, default: true }, // Visible to both parties
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Communication system
    messages: [{ 
        content: { type: String, required: true },
        sender: { 
            type: mongoose.Schema.Types.ObjectId, 
            refPath: 'messages.senderModel',
            required: true
        },
        senderModel: {
            type: String,
            required: true,
            enum: ['Citizen', 'Lawyer']
        },
        messageType: {
            type: String,
            enum: ["message", "status-update", "document-shared", "hearing-scheduled", "settlement-offer"],
            default: "message"
        },
        isPrivate: { type: Boolean, default: false }, // Private notes only visible to sender
        createdAt: { type: Date, default: Date.now },
        readBy: [{
            user: { type: mongoose.Schema.Types.ObjectId, refPath: 'messages.readBy.userModel' },
            userModel: { type: String, enum: ['Citizen', 'Lawyer'] },
            readAt: { type: Date, default: Date.now }
        }]
    }],
    
    // Settlement and resolution tracking
    settlementOffers: [{
        offeredBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'settlementOffers.offeredByModel' },
        offeredByModel: { type: String, enum: ['Citizen', 'Lawyer'] },
        amount: { type: Number },
        terms: { type: String },
        status: { type: String, enum: ["pending", "accepted", "rejected", "withdrawn"], default: "pending" },
        expiresAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
        respondedAt: { type: Date }
    }],
    
    resolutionDetails: {
        type: {
            type: String,
            enum: ["settlement", "mediation-agreement", "court-judgment", "voluntary-withdrawal"]
        },
        amount: { type: Number },
        terms: { type: String },
        agreedBy: [{
            party: { type: mongoose.Schema.Types.ObjectId, refPath: 'resolutionDetails.agreedBy.partyModel' },
            partyModel: { type: String, enum: ['Citizen', 'Lawyer'] },
            agreedAt: { type: Date, default: Date.now },
            signature: { type: String } // Digital signature or agreement confirmation
        }],
        finalizedAt: { type: Date }
    },
    
    // Notifications and alerts
    notifications: [{
        recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'notifications.recipientModel' },
        recipientModel: { type: String, enum: ['Citizen', 'Lawyer'] },
        type: {
            type: String,
            enum: ["assignment", "message", "document", "hearing", "status-change", "settlement", "deadline"]
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Deadlines and reminders
    deadlines: [{
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date, required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'deadlines.assignedToModel' },
        assignedToModel: { type: String, enum: ['Citizen', 'Lawyer'] },
        status: { type: String, enum: ["pending", "completed", "overdue"], default: "pending" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'deadlines.createdByModel' },
        createdByModel: { type: String, enum: ['Citizen', 'Lawyer'] },
        completedAt: { type: Date }
    }],
    
    // Tracking and analytics
    estimatedResolutionTime: { type: Number }, // in days
    actualResolutionTime: { type: Number }, // in days
    costEstimate: { type: Number },
    actualCost: { type: Number },
    
    // System fields
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'archivedByModel' },
    archivedByModel: { type: String, enum: ['Citizen', 'Lawyer'] },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now } // Track when last action occurred
});

// Indexes for better performance
disputeSchema.index({ createdBy: 1, status: 1 });
disputeSchema.index({ assignedLawyer: 1, status: 1 });
disputeSchema.index({ status: 1, priority: 1 });
disputeSchema.index({ category: 1, status: 1 });
disputeSchema.index({ nextHearing: 1 });
disputeSchema.index({ lastActivity: -1 });

// Pre-save middleware to update timestamps
disputeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    this.lastActivity = new Date();
    next();
});

export default mongoose.model("Dispute", disputeSchema);
