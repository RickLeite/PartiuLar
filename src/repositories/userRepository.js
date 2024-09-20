import { run } from "../database.js";


export async function findAll() {
    console.log("Função findAll")

    const connection= await run();

    const data = await connection.execute(
        `SELECT * FROM usuarios `
    );

    await connection.close()
    return data.rows;
}

export async function findUserById(id) {
    console.log("Função findUserById")

    const connection= await run();

    const data = await connection.execute(
        `SELECT * FROM usuarios WHERE id = ${id}`
    );

    await connection.close()
    return data.rows;
}

export async function save(body){
    console.log("Função save")

    const connection= await run();

    const user = await connection.execute(
        `INSERT INTO usuarios (id, nome, email) VALUES (:id, :nome, :email)`,
        {
            id: body.id,  // Mapeia o valor body.id para o placeholder :id
            nome: body.nome,  // Mapeia o valor body.nome para o placeholder :nome
            email: body.email,  // Mapeia o valor body.cep para o placeholder :cep
        },

        { autoCommit: true }
    );

    
    await connection.close()

    return findUserById(body.id)

}
    

