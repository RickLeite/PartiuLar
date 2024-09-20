import {getUsers, getUserById, postUser} from '../controllers/user.controller.js'
import express from 'express';

const router = express.Router();

// EXEMPLOS DE ROTAS


router.get('/users', getUsers);
router.get('/:id', getUserById)
router.post('/inserirUser', postUser)


router.post('/user', (req, res) => {
    res.send('Post user');
});

export default router;