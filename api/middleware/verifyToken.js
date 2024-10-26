import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Verifica primeiro o cookie
    const cookieToken = req.cookies.token;

    // Verifica o cabeçalho de autorização (se o token não estiver no cookie)
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // Usa o token do cookie ou do cabeçalho de autorização
    const token = cookieToken || bearerToken;

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado: Token não fornecido' });
    }

    // Verifica e decodifica o token
    jwt.verify(token, "Ye2Xg+0h+k0kiUGoIu62jLTAoYYLTmJ5Zr0idiPSK2Y=", async (err, payload) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado' });
        }

        // Atribui o userId a partir do payload decodificado
        req.userId = payload.id;
        next();
    });
};
