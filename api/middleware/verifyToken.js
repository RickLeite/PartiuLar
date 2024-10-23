import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado' });
    }

    jwt.verify(token, "Ye2Xg+0h+k0kiUGoIu62jLTAoYYLTmJ5Zr0idiPSK2Y=", async (err, payload) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });

        req.userId = payload.id;
        next();
    });
}
