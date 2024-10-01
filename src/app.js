import express from 'express';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
    res.sendFile('public/cadastro.html', { root: '.' });
});

const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}!`);
});