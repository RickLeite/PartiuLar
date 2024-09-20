import {getUsers, getUserById, postUser, editarUser, deleteUser} from '../controllers/user.controller.js'
import express from 'express';

const router = express.Router();

// EXEMPLOS DE ROTAS


router.get('/users', getUsers);
router.get('/users/:id', getUserById);

router.post('/inserirUser', postUser);

router.put("/editarUser", editarUser)

router.delete("/deleteUser/:condicao", deleteUser);


router.post('/user', (req, res) => {
    res.send('Post user');
});

export default router;