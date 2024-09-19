export const register = (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);

    // REGISTRAR username, email, password
    // NO BANCO DE DADOS
}

export const login = (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    // VERIFICAR SE email e password ESTÃO CORRETOS
}

export const logout = (req, res) => {
    res.send('Logout');
}