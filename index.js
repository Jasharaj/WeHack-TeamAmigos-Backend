import express from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoute from './routes/auth.js'
import citizenRoute from './routes/citizen.js'
import lawyerRoute from './routes/lawyer.js'
import caseRoute from './routes/case.js'
import documentRoute from './routes/document.js'
import reminderRoute from './routes/reminder.js'
import disputeRoute from './routes/dispute.js'
import reportRoute from './routes/report.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

const corsOptions = {
    origin: true,
};

app.get("/", (req, res) => {
    res.send("Api is working")
})

//database connection
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        
        console.log("MongoDB database is connected successfully");
    } catch (err) {
        console.log("MongoDB database connection failed");
        console.error(err.message);
    }
}

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

// Serve static files for document uploads
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/v1/auth', authRoute)
app.use('/api/v1/citizen', citizenRoute)
app.use('/api/v1/lawyer', lawyerRoute)
app.use('/api/v1/cases', caseRoute)
app.use('/api/v1/documents', documentRoute)
app.use('/api/v1/reminders', reminderRoute)
app.use('/api/v1/disputes', disputeRoute)
app.use('/api/v1/reports', reportRoute)

app.listen(port, () => {
    connectDB()
    console.log(`Server is running on port ${port}`)
})


