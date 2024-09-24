import {getUsers, getUserById, postUser, editarUser, deleteUser} from '../controllers/user.controller.js'
import express from 'express';

const router = express.Router();


//ROTAS GET
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

//ROTAS POST
router.post('/inserirUser', postUser);

//ROTAS PUT
router.put("/editarUser", editarUser)

//ROTAS DELETE
router.delete("/deleteUser/:condicao", deleteUser);


export default router;