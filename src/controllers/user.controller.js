import {findAll, findUserById, save} from '../repositories/userRepository.js';



export async function getUsers(req, res) {
    console.log("Função usuarios")
    const data = await findAll()
    console.log(data)
    res.json(data);
} 

export async function getUserById(req, res) {
    console.log("Função usuarios")
    const data = await findUserById(req.params.id)
    console.log(data)
    res.json(data);
}

export async function postUser(req, res){
    const {id, nome, email, data_nascimento} = req.body
    const user = await save({id, nome, email})

    console.log(user)

    res.json(user)
}



