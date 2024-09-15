const express = require('express');

const router = express.Router();

// EXEMPLOS DE ROTAS

router.get('/home', (req, res) => {
    res.send('Get home');
});

router.post('/home', (req, res) => {
    res.send('Create home');
});

module.exports = router;