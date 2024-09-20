const express = require('express');

const router = express.Router();

// EXEMPLOS DE ROTAS

router.get('/home', (req, res) => {
    res.send('Get home');
});

router.post('/homes', (req, res) => {
    res.send('Create home');
});

export default router;
module.exports = router;
