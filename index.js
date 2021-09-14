const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('./router/userRouter');
const productRouter = require('./router/productRouter');

// connect to db
const db = 'mongodb://localhost/btgk';
const port = 4002;
mongoose.connect(db);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);

app.listen(port, () => {
    console.log('Server running on: ', port)
});