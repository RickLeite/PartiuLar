import express from 'express';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}!`);
});