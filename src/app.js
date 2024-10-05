import express from 'express';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import testRouter from './routes/test.route.js';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/test', testRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);

const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}!`);
});