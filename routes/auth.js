import express from 'express';
import { register, login, logout, getAllUsers, deleteAllUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/all-users', getAllUsers);
router.delete('/delete-all-users', deleteAllUsers);

export default router;