import {findAll, findUserById, save, updateUser, deleteUserByIdAndEmail} from '../repositories/userRepository.js';



//METODOS GET
export async function getUsers(req, res) {
    const data = await findAll()
    console.log(data)
    res.json(data);
} 
export async function getUserById(req, res) {
    const data = await findUserById(req.params.id)
    console.log(data)
    res.json(data);
}

//METODOS POST
//O BODY ESTÁ DE ACORDO COM UMA TABELA TESTE, PRECISA MUDAR PARA NOSSA TABELA
export async function postUser(req, res){
    const {id, nome, email} = req.body
    const user = await save({id, nome, email})
    console.log(user)
    res.json(user)
}

export async function editarUser(req, res){
    const {id, nome, email} = req.body
    const user = await updateUser({id, nome, email})
    console.log(user)
    res.json(user)
}

//METODOS DELETE
export async function deleteUser(req, res) {
    const data = await deleteUserByIdAndEmail(req.params.condicao)
    console.log(data)
    res.json(data);
}


