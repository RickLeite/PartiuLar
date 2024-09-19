import express from 'express';

const router = express.Router();

// EXEMPLOS DE ROTAS

router.get('/user', (req, res) => {
    res.send('Get User');
});

router.post('/user', (req, res) => {
    res.send('Post user');
});

export default router;