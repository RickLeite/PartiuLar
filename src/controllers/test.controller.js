import jwt from 'jsonwebtoken';

export const shouldBeLoggedIn = async (req, res) => {
    console.log("req.userId:", req.userId);
    res.status(200).json({ message: 'Você está logado' });
};
