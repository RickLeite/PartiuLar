import express from 'express';
import { deleteUser, getUser, getUsers, updateUser, profilePosts } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', verifyToken, getUser);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);
router.get('/profilePosts/:id', verifyToken, profilePosts);

export default router;