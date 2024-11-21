import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

dotenv.config();
console.log('Database URL:', process.env.DATABASE_URL);

const app = express();

// Configuração CORS simplificada para desenvolvimento
app.use(cors({
    origin: true, // Permite todas as origens
    credentials: true // Mantém suporte a cookies
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

const PORT = 8800;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}!`);
});