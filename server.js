const express = require('express');
const mongoose = require('mongoose');
//const expressSanitize = require('express-mongo-sanitize');
const mainRoutes = require('./routes/main-routes');

const PORT = process.env.PORT || 80;

const app = express();

//app.use(expressSanitize);
app.use(express.json());
app.use(mainRoutes);

async function dbConnect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/contacts');
        console.log("Connection with database established");

        app.listen(PORT, () => {
            console.log('Server started');
        });
    } catch(e) {
        console.log(e);
    }
}

dbConnect();

/*

    How it works

    GET /contact/:id , where id - its {uuid} from db
    GET /contacts/?query , where query can have city=Kiev , company=AVA.codes, group=managers, duplicates=1, without query it will all contants
    POST /contacts/ , body must have "contact": { "name": "a", "phone": "1", ...} or "contacts": [{}, {}, ...]
    PUT /contacts/ , body must have "contact": { "name": "a", "phone": "1", ...} or "contacts": [{}, {}, ...] and required _id for each {}
    DELETE /contacts/ , body must have contact_ids: ["_id", "_id", ...] or contact_id: _id to delete one contact

*/