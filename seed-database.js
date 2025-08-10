import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import Citizen from './models/CitizenSchema.js';
import Lawyer from './models/LawyerSchema.js';
import Case from './models/CaseSchema.js';
import Dispute from './models/DisputeSchema.js';
import Reminder from './models/ReminderSchema.js';
import Document from './models/DocumentSchema.js';

// Load environment variables
dotenv.config();

// Sample data
const citizens = [
    {
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'citizen'
    },
    {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'citizen'
    },
    {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        password: 'password123',
        phone: '+1234567892',
        role: 'citizen'
    },
    {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        password: 'password123',
        phone: '+1234567893',
        role: 'citizen'
    },
    {
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        password: 'password123',
        phone: '+1234567894',
        role: 'citizen'
    },
    {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        password: 'password123',
        phone: '+1234567895',
        role: 'citizen'
    },
    {
        name: 'James Miller',
        email: 'james.miller@email.com',
        password: 'password123',
        phone: '+1234567896',
        role: 'citizen'
    },
    {
        name: 'Jennifer Taylor',
        email: 'jennifer.taylor@email.com',
        password: 'password123',
        phone: '+1234567897',
        role: 'citizen'
    }
];

const lawyers = [
    {
        name: 'Robert Thompson',
        email: 'robert.thompson@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654321',
        role: 'lawyer',
        licenseNumber: 'LAW001',
        specialization: 'Criminal Law',
        yearsOfExperience: 15
    },
    {
        name: 'Maria Garcia',
        email: 'maria.garcia@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654322',
        role: 'lawyer',
        licenseNumber: 'LAW002',
        specialization: 'Family Law',
        yearsOfExperience: 12
    },
    {
        name: 'William Jones',
        email: 'william.jones@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654323',
        role: 'lawyer',
        licenseNumber: 'LAW003',
        specialization: 'Corporate Law',
        yearsOfExperience: 20
    },
    {
        name: 'Amanda White',
        email: 'amanda.white@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654324',
        role: 'lawyer',
        licenseNumber: 'LAW004',
        specialization: 'Real Estate Law',
        yearsOfExperience: 8
    },
    {
        name: 'Daniel Martinez',
        email: 'daniel.martinez@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654325',
        role: 'lawyer',
        licenseNumber: 'LAW005',
        specialization: 'Personal Injury',
        yearsOfExperience: 10
    },
    {
        name: 'Rachel Green',
        email: 'rachel.green@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654326',
        role: 'lawyer',
        licenseNumber: 'LAW006',
        specialization: 'Employment Law',
        yearsOfExperience: 7
    },
    {
        name: 'Christopher Lee',
        email: 'christopher.lee@lawfirm.com',
        password: 'lawyer123',
        phone: '+1987654327',
        role: 'lawyer',
        licenseNumber: 'LAW007',
        specialization: 'Immigration Law',
        yearsOfExperience: 13
    }
];

// Helper function to hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB Atlas');

        // Clear existing data
        console.log('🗑️ Clearing existing data...');
        await Promise.all([
            Citizen.deleteMany({}),
            Lawyer.deleteMany({}),
            Case.deleteMany({}),
            Dispute.deleteMany({}),
            Reminder.deleteMany({}),
            Document.deleteMany({})
        ]);
        console.log('✅ Existing data cleared');

        // Create citizens
        console.log('👤 Creating citizens...');
        const hashedCitizens = await Promise.all(
            citizens.map(async (citizen) => ({
                ...citizen,
                password: await hashPassword(citizen.password)
            }))
        );
        const createdCitizens = await Citizen.insertMany(hashedCitizens);
        console.log(`✅ Created ${createdCitizens.length} citizens`);

        // Create lawyers
        console.log('⚖️ Creating lawyers...');
        const hashedLawyers = await Promise.all(
            lawyers.map(async (lawyer) => ({
                ...lawyer,
                password: await hashPassword(lawyer.password)
            }))
        );
        const createdLawyers = await Lawyer.insertMany(hashedLawyers);
        console.log(`✅ Created ${createdLawyers.length} lawyers`);

        // Create cases
        console.log('📋 Creating cases...');
        const cases = [
            {
                title: 'Property Dispute Resolution',
                description: 'Neighbor dispute over property boundary lines and fence placement.',
                caseType: 'property',
                citizen: createdCitizens[0]._id,
                lawyer: createdLawyers[3]._id, // Real Estate lawyer
                status: 'in progress'
            },
            {
                title: 'Divorce Proceedings',
                description: 'Amicable divorce with child custody arrangements.',
                caseType: 'family',
                citizen: createdCitizens[1]._id,
                lawyer: createdLawyers[1]._id, // Family lawyer
                status: 'in progress'
            },
            {
                title: 'Employment Discrimination Case',
                description: 'Workplace harassment and discrimination complaint.',
                caseType: 'civil',
                citizen: createdCitizens[2]._id,
                lawyer: createdLawyers[5]._id, // Employment lawyer
                status: 'pending'
            },
            {
                title: 'Car Accident Claim',
                description: 'Personal injury claim from motor vehicle accident.',
                caseType: 'civil',
                citizen: createdCitizens[3]._id,
                lawyer: createdLawyers[4]._id, // Personal Injury lawyer
                status: 'resolved'
            },
            {
                title: 'Immigration Status Appeal',
                description: 'Appeal for visa rejection and status adjustment.',
                caseType: 'others',
                citizen: createdCitizens[4]._id,
                lawyer: createdLawyers[6]._id, // Immigration lawyer
                status: 'in progress'
            },
            {
                title: 'Criminal Defense Case',
                description: 'Defense against misdemeanor charges.',
                caseType: 'criminal',
                citizen: createdCitizens[5]._id,
                lawyer: createdLawyers[0]._id, // Criminal lawyer
                status: 'pending'
            },
            {
                title: 'Consumer Product Complaint',
                description: 'Defective product causing damages and seeking compensation.',
                caseType: 'consumer',
                citizen: createdCitizens[6]._id,
                lawyer: createdLawyers[2]._id, // Corporate lawyer
                status: 'in progress'
            },
            {
                title: 'Child Custody Modification',
                description: 'Request to modify existing custody arrangement.',
                caseType: 'family',
                citizen: createdCitizens[7]._id,
                status: 'pending' // No lawyer assigned yet
            }
        ];

        const createdCases = await Case.insertMany(cases);
        console.log(`✅ Created ${createdCases.length} cases`);

        // Update lawyer's assigned cases
        for (const caseItem of createdCases) {
            if (caseItem.lawyer) {
                await Lawyer.findByIdAndUpdate(
                    caseItem.lawyer,
                    { $push: { casesAssigned: caseItem._id } }
                );
            }
        }

        // Update citizen's cases
        for (const caseItem of createdCases) {
            await Citizen.findByIdAndUpdate(
                caseItem.citizen,
                { $push: { cases: caseItem._id } }
            );
        }

        // Create disputes
        console.log('⚔️ Creating disputes...');
        const disputes = [
            {
                title: 'Landlord-Tenant Dispute',
                description: 'Disagreement over security deposit return and property damages.',
                category: 'property',
                status: 'pending',
                parties: {
                    plaintiff: {
                        id: createdCitizens[0]._id,
                        name: createdCitizens[0].name,
                        type: 'Citizen',
                        contactEmail: createdCitizens[0].email
                    },
                    defendant: {
                        name: 'Metro Properties LLC',
                        type: 'External',
                        contactEmail: 'legal@metroproperties.com'
                    }
                },
                createdBy: createdCitizens[0]._id,
                createdByModel: 'Citizen'
            },
            {
                title: 'Consumer Product Complaint',
                description: 'Defective product causing damages, seeking compensation.',
                category: 'civil',
                status: 'assigned',
                assignedLawyer: createdLawyers[2]._id,
                parties: {
                    plaintiff: {
                        id: createdCitizens[2]._id,
                        name: createdCitizens[2].name,
                        type: 'Citizen',
                        contactEmail: createdCitizens[2].email
                    },
                    defendant: {
                        name: 'TechCorp Industries',
                        type: 'External',
                        contactEmail: 'legal@techcorp.com'
                    }
                },
                createdBy: createdCitizens[2]._id,
                createdByModel: 'Citizen'
            },
            {
                title: 'Workplace Harassment',
                description: 'Ongoing workplace harassment and hostile work environment.',
                category: 'employment',
                status: 'mediation',
                assignedLawyer: createdLawyers[5]._id,
                parties: {
                    plaintiff: {
                        id: createdCitizens[3]._id,
                        name: createdCitizens[3].name,
                        type: 'Citizen',
                        contactEmail: createdCitizens[3].email
                    },
                    defendant: {
                        name: 'Global Solutions Inc',
                        type: 'External',
                        contactEmail: 'hr@globalsolutions.com'
                    }
                },
                createdBy: createdCitizens[3]._id,
                createdByModel: 'Citizen'
            }
        ];

        const createdDisputes = await Dispute.insertMany(disputes);
        console.log(`✅ Created ${createdDisputes.length} disputes`);

        // Create reminders
        console.log('⏰ Creating reminders...');
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const reminders = [
            {
                title: 'Court Hearing Preparation',
                description: 'Prepare documents and evidence for tomorrow\'s hearing',
                dueDate: tomorrow,
                priority: 'high',
                userId: createdCitizens[0]._id,
                userModel: 'Citizen',
                caseId: createdCases[0]._id,
                caseName: createdCases[0].title
            },
            {
                title: 'Client Meeting - Divorce Case',
                description: 'Meet with client to discuss custody arrangements',
                dueDate: nextWeek,
                priority: 'medium',
                userId: createdLawyers[1]._id,
                userModel: 'Lawyer',
                caseId: createdCases[1]._id,
                caseName: createdCases[1].title
            },
            {
                title: 'Document Deadline',
                description: 'Submit employment discrimination evidence to court',
                dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
                priority: 'high',
                userId: createdCitizens[2]._id,
                userModel: 'Citizen',
                caseId: createdCases[2]._id,
                caseName: createdCases[2].title
            },
            {
                title: 'Case Review',
                description: 'Review immigration appeal documentation',
                dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                priority: 'medium',
                userId: createdLawyers[6]._id,
                userModel: 'Lawyer',
                caseId: createdCases[4]._id,
                caseName: createdCases[4].title
            }
        ];

        const createdReminders = await Reminder.insertMany(reminders);
        console.log(`✅ Created ${createdReminders.length} reminders`);

        // Create sample documents
        console.log('📄 Creating documents...');
        const documents = [
            {
                title: 'Property Deed Copy',
                description: 'Official property deed for boundary dispute case',
                category: 'evidence',
                fileName: 'property_deed.pdf',
                fileType: 'pdf',
                fileSize: 1024000, // 1MB
                filePath: 'https://example.com/property_deed.pdf',
                status: 'approved',
                uploadedBy: createdCitizens[0]._id,
                uploaderModel: 'Citizen',
                caseId: createdCases[0]._id,
                tags: ['property', 'deed', 'official']
            },
            {
                title: 'Medical Records',
                description: 'Medical documentation for personal injury claim',
                category: 'evidence',
                fileName: 'medical_records.pdf',
                fileType: 'pdf',
                fileSize: 2048000, // 2MB
                filePath: 'https://example.com/medical_records.pdf',
                status: 'pending',
                uploadedBy: createdCitizens[3]._id,
                uploaderModel: 'Citizen',
                caseId: createdCases[3]._id,
                tags: ['medical', 'injury', 'treatment']
            },
            {
                title: 'Employment Contract',
                description: 'Original employment agreement and terms',
                category: 'contract',
                fileName: 'employment_contract.pdf',
                fileType: 'pdf',
                fileSize: 512000, // 512KB
                filePath: 'https://example.com/employment_contract.pdf',
                status: 'approved',
                uploadedBy: createdCitizens[2]._id,
                uploaderModel: 'Citizen',
                caseId: createdCases[2]._id,
                tags: ['contract', 'employment', 'terms']
            },
            {
                title: 'Witness Statement',
                description: 'Signed witness statement for criminal defense',
                category: 'evidence',
                fileName: 'witness_statement.pdf',
                fileType: 'pdf',
                fileSize: 256000, // 256KB
                filePath: 'https://example.com/witness_statement.pdf',
                status: 'pending',
                uploadedBy: createdCitizens[5]._id,
                uploaderModel: 'Citizen',
                caseId: createdCases[5]._id,
                tags: ['witness', 'statement', 'evidence']
            },
            {
                title: 'Court Filing Receipt',
                description: 'Receipt confirmation for court document filing',
                category: 'court',
                fileName: 'court_filing_receipt.pdf',
                fileType: 'pdf',
                fileSize: 128000, // 128KB
                filePath: 'https://example.com/court_filing_receipt.pdf',
                status: 'approved',
                uploadedBy: createdLawyers[1]._id,
                uploaderModel: 'Lawyer',
                caseId: createdCases[1]._id,
                tags: ['court', 'filing', 'receipt']
            }
        ];

        const createdDocuments = await Document.insertMany(documents);
        console.log(`✅ Created ${createdDocuments.length} documents`);

        // Summary
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`👤 Citizens: ${createdCitizens.length}`);
        console.log(`⚖️ Lawyers: ${createdLawyers.length}`);
        console.log(`📋 Cases: ${createdCases.length}`);
        console.log(`⚔️ Disputes: ${createdDisputes.length}`);
        console.log(`⏰ Reminders: ${createdReminders.length}`);
        console.log(`📄 Documents: ${createdDocuments.length}`);
        
        console.log('\n🔐 Test Credentials:');
        console.log('Citizens - Email: john.smith@email.com | Password: password123');
        console.log('Lawyers - Email: robert.thompson@lawfirm.com | Password: lawyer123');
        
        console.log('\n✅ Your application is now ready for testing!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the seed function
seedDatabase();
