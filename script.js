
const divProducts = document.querySelector("#product-div")
const divCesto = document.querySelector("#produtos-selecionados")
const total = document.querySelector("#total")
const inputName = document.querySelector("#procurarProdutos")
const categorysSelection = document.querySelector("#categoriesid")
const ordenar = document.querySelector("#ordenar")
const deisi = document.querySelector("#student")
const cupom = document.querySelector("#cupom")
const nome = document.querySelector("#nome")
const comprar = document.querySelector("#comprar")
const resultadoCompra = document.querySelector("#resultado-compra")
let compraEmCurso = false

if (!localStorage.getItem("produtos-selecionados")) {
    localStorage.setItem("produtos-selecionados", JSON.stringify([]))
}

const criarProduto = (produto) => {
    const newArticle = document.createElement("article")
    const imagem = new URL(produto.image, "https://deisishop.pw.deisi.ulusofona.pt/").href
    newArticle.innerHTML = `
        <h3>${produto.title}</h3>
        <img src="${imagem}" alt="${produto.title}">
        <p>${produto.description}</p>
        <span>${Number(produto.price).toFixed(2)} €</span>
    `

    const button = document.createElement("button")
    button.textContent = "+ Adicionar ao cesto"
    button.onclick = () => {
        const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || []
        lista.push(produto)
        localStorage.setItem("produtos-selecionados", JSON.stringify(lista))
        atualizaCesto()
        resultadoCompra.textContent = ""
    }

    newArticle.append(button)
    return newArticle
}

const criarProdutoCesto = (produto) => {
    const newArticle = document.createElement("article")
    const imagem = new URL(produto.image, "https://deisishop.pw.deisi.ulusofona.pt/").href
    newArticle.innerHTML = `
        <h3>${produto.title}</h3>
        <img src="${imagem}" alt="${produto.title}">
        <p>${Number(produto.price).toFixed(2)} €</p>
    `

    const button = document.createElement("button")
    button.textContent = "Remover"
    button.onclick = () => {
        const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || []
        const index = lista.findIndex(p => p.id === produto.id)

        if (index !== -1) {
            lista.splice(index, 1)
            localStorage.setItem("produtos-selecionados", JSON.stringify(lista))
            atualizaCesto()
            resultadoCompra.textContent = ""
        }
    }

    newArticle.append(button)
    return newArticle
}

const renderizarProdutos = (lista) => {
    divProducts.replaceChildren()
    lista.forEach(p => divProducts.append(criarProduto(p)))

    if (lista.length === 0) {
        divProducts.textContent = "Nenhum produto encontrado."
    }
}

const createSelection = (products) => {
    const list = []
    products.forEach(p => {
        if (!list.includes(p.category)) {
            list.push(p.category)
        }
    })

    categorysSelection.innerHTML = '<option value="todos">Todos</option>'
    list.forEach(l => {
        const option = document.createElement("option")
        option.value = l
        option.textContent = l
        categorysSelection.append(option)
    })
}

const atualizaCesto = () => {
    const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || []
    divCesto.replaceChildren()
    lista.forEach(p => divCesto.append(criarProdutoCesto(p)))

    if (lista.length === 0) {
        divCesto.textContent = "O cesto está vazio."
    }

    const precoTotal = lista.reduce((soma, p) => soma + Number(p.price), 0)
    total.textContent = `Total: ${Number(precoTotal).toFixed(2)} €`
    comprar.disabled = lista.length === 0 || compraEmCurso
}

const createParamToCart = (cartOptionsInput) => {
    const newCartOptions = cartOptionsInput || {
        check: false,
        cupom: ""
    }

    const cartOptions = JSON.parse(localStorage.getItem("cart-options")) || newCartOptions

    localStorage.setItem("cart-options", JSON.stringify(cartOptions))
    deisi.checked = cartOptions.check
    cupom.value = cartOptions.cupom
}

const changeParamToCart = () => {
    const checkValue = deisi.checked
    const cupomDeisi = cupom.value
    const cartOptions = {
        check: checkValue,
        cupom: cupomDeisi
    }

    localStorage.setItem("cart-options", JSON.stringify(cartOptions))
}

deisi.onchange = changeParamToCart
cupom.oninput = changeParamToCart

const finalizarCompra = () => {
    const lista = JSON.parse(localStorage.getItem("produtos-selecionados") || "[]")

    if (lista.length === 0 || compraEmCurso) {
        return
    }

    if (!nome.value.trim()) {
        resultadoCompra.textContent = "Introduz o teu nome para finalizar a compra."
        nome.focus()
        return
    }

    const dadosCompra = {
        products: lista.map(p => p.id),
        student: deisi.checked,
        coupon: cupom.value.trim(),
        name: nome.value.trim()
    }

    compraEmCurso = true
    comprar.disabled = true
    resultadoCompra.textContent = "A processar compra..."

    fetch("https://deisishop.pw.deisi.ulusofona.pt/buy", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dadosCompra)
    })
    .then(response => response.json().then(data => response.ok ? data : Promise.reject(Error(data.error || `HTTP ${response.status}`))))
    .then(data => {
        if (!data.reference || data.totalCost == null) {
            throw new Error("Resposta da API sem referência ou total")
        }

        resultadoCompra.textContent = `Referência para pagamento: ${data.reference} | Total: ${data.totalCost} €`
        localStorage.setItem("produtos-selecionados", JSON.stringify([]))
        atualizaCesto()
    })
    .catch(error => resultadoCompra.textContent = `Erro na compra: ${error.message}`)
    .finally(() => {
        compraEmCurso = false
        atualizaCesto()
    })
}

comprar.onclick = finalizarCompra

let produtos = []

const filtrarProdutos = () => {
    const nome = inputName.value.toLowerCase()
    const categoria = categorysSelection.value

    const lista = produtos.filter(p =>
        p.title.toLowerCase().includes(nome) &&
        (categoria === "todos" || p.category === categoria)
    )

    lista.sort((a, b) => ordenar.value === "menor" ? a.price - b.price : b.price - a.price)
    renderizarProdutos(lista)
}

inputName.oninput = filtrarProdutos
categorysSelection.onchange = filtrarProdutos
ordenar.onchange = filtrarProdutos

fetch("https://deisishop.pw.deisi.ulusofona.pt/products")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        return response.json()
    })
    .then(data => {
        console.log("Products received:", data)
        produtos = data
        createSelection(produtos)
        filtrarProdutos()
    })
    .catch(error => {
        console.error("Failed to load products:", error)
        divProducts.textContent = "Não foi possível carregar os produtos."
    })

createParamToCart(null)
atualizaCesto()
