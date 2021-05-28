const express = require('express');
const mongoose = require ('mongoose');
const cors = require ('cors');
const routes = require('./routes');
const app = express();
require('dotenv/config');

mongoose.connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});

app.use(cors()); //tem que fazer no front
app.use(express.json());
app.use(routes);

app.listen (3333);
