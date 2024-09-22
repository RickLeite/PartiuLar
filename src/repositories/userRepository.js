
import { run, query } from "../database.js";


export async function save(body) {
    console.log("Função save");
    const { nome, email } = body;
    const data = await query(
        'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
        [nome, email]
    );
    return data.rows[0];
}


export async function findAll() {
    console.log("Função findAll");
    const data = await query('SELECT * FROM usuarios');
    return data.rows;
}

export async function findUserById(id) {
    console.log("Função findUserById");
    const data = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return data.rows[0];
}

export async function updateUser(body) {
    console.log("Função updateUser");
    const { id, nome, email } = body;
    const data = await query(
        'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING *',
        [nome, email, id]
    );
    return data.rows[0];
}

export async function deleteUserByIdAndEmail(condicao) {
    let data;
    if (condicao.includes("@")) {
        data = await query('DELETE FROM usuarios WHERE email = $1 RETURNING *', [condicao]);
    } else {
        const id = parseInt(condicao);
        data = await query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    }
    return data.rows[0];
}