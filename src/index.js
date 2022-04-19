const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid"); 

const app = express();

app.use(express.json());

const customers = [];


function verifyExistAccount(req, res, next){
    const {cpf} = req.headers;
    
    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer){
        return res.status(400).json({error: "Customer not found!"});
    }

    req.customer = customer;

    return next();
}



app.post("/account", (req, res) => {
    const { cpf, name } = req.body;
    const id = uuidv4();

    const customerExists = customers.some((customer) => customer.cpf === cpf);

    if(customerExists){
        return res.status(400).json({error: "Customer already exists!"});
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return res.status(201).send()
});

app.get("/statement", verifyExistAccount, (req, res) => {
    const {customer} = req;
    
    return res.status(200).json(customer.statement);
});

app.get("/statement/date", verifyExistAccount, (req, res) => {
    const {customer} = req;

    const {date} = req.query;
    const dateFormat = new Date(date + "00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());
    
    return res.status(200).json(statement);
});

app.post("/deposito", verifyExistAccount, (req, res) => {
    const {description, amount} = req.body;

    const {customer} = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    };

    customer.statement.push(statementOperation);

    return res.status(201).send();
});

app.listen(3333);