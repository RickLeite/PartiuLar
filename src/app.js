import express from 'express';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);


app.get('/inicio', (req, res) => {
    res.send("Pagina inicial")
})

app.listen(8800, () => {
    console.log("Server is up and running!");
});