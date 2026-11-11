const dados = document.querySelector("#dados")
const node_p = document.querySelector("#getone")
const nome = document.querySelector("#post-nome")
const idade = document.querySelector("#post-idade")
const postButton = document.querySelector("#post-button")
const aside = document.querySelector("#new-amigo")
const node_button = document.querySelector("#put-button")
const p_put = document.querySelector("#put-p")

fetch("https://amigos.pw.deisi.ulusofona.pt/amigos/")
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao obter amigos")
        }
        return response.json()
    })
    .then(data => dados.textContent = JSON.stringify(data))
    .catch(() => dados.textContent = "Erro ao obter amigos")

const obterAmigo = id => {
    fetch(`https://amigos.pw.deisi.ulusofona.pt/amigos/${id}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Amigo não encontrado")
            }
            return response.json()
        })
        .then(data => node_p.textContent = `${data.nome}, ${data.idade} anos (id: ${data.id})`)
        .catch(() => node_p.textContent = "Erro ao obter amigo")
}

obterAmigo(3)

const criarNovo = () => {
    if (nome.value.trim() === "" || idade.value === "") {
        aside.textContent = "Preencha o nome e a idade"
        return
    }

    fetch("https://amigos.pw.deisi.ulusofona.pt/amigos/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nome: nome.value,
            idade: Number(idade.value)
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            return response.json()
        })
        .then(data => {
            aside.textContent = `Registo criado: ${data.nome}, ${data.idade} anos`
        })
        .catch(error => aside.textContent = `Erro: ${error.message}`)
}

postButton.onclick = criarNovo

const id_amigo = 3
const dados_amigo = {
    nome: "Julia",
    idade: 19
}

const alterarDados = () => {
    fetch(`https://amigos.pw.deisi.ulusofona.pt/amigos/${id_amigo}/`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dados_amigo)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            return response.json()
        })
        .then(data => {
            p_put.textContent = `Dados de amigo alterados: ${data.nome}, ${data.idade}`
        })
        .catch(error => p_put.textContent = `Erro: ${error.message}`)
}

node_button.onclick = alterarDados
