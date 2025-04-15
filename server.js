const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json())//req.body
const PORT = process.env.PORT || 3001;

//Import jwt token
const {jwtAuthMiddleware} = require('./jwt');

//Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidatesRoutes');

app.use('/user',userRoutes);
app.use('/candidate',jwtAuthMiddleware,candidateRoutes);

app.listen(PORT,()=>{
    console.log('listening on port 3001');
})