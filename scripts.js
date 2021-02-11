const Modal = {
    open(){
        //Abrir Modal
        // Adicionar a cass active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close(){
        //Fechar Modal
        // Remover a cass active do modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // Somar as entradas
        let income = 0

        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })
        return income
    },
    expenses() {
        // Somar as saídas
        let expense = 0

        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0){
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        // Total
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
            // <td class="category">${transaction.category}</td>
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            
            <td class="category">
            <img src="./assets/icon-${transaction.category}.png" alt="${transaction.category}">
            </td>
            <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = 
             Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = 
             Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = 
             Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]} `
    },

    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value

    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    category: document.getElementById("category"),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            category: Form.category.value,
            date: Form.date.value,
        }
    },

    validadeFields() {
        const { description, amount, category, date } = Form.getValues()

        if(
            description.trim() === "" ||
            amount.trim() === "" ||
            category.trim() === "" ||
            date.trim() === ""
        ){
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues() {
        let { description, amount, category, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            category,
            date
        }

    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.category.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()



        try{
            Form.validadeFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        }catch(error){
            alert(error.message)
        }
    },
}

const App = {
    init () {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()