const express = require('express');
const Joi = require('joi');
const productRouter = express.Router();
const ProductModel = require('../model/product.model');

// Danh sach san pham
productRouter.get('/', (req,res) => {
    ProductModel.find({}).exec((err, products) => {
        if (err) {
            res.send('Khong the lay danh sach san pham thanh cong');
        } else {
            res.json(products);
        }
    })
});
// Lay thong tin 1 san pham
productRouter.get('/:id', (req,res) => {
    ProductModel.findById({ _id: req.params.id}).exec((err, product) => {
        if (err) {
            res.send('Khong the lay san pham');
        } else {
            res.json(product);
        }
    });
});

// Cap nhat thong tin san pham
productRouter.put('/:id', (req,res) => {
    ProductModel.findByIdAndUpdate({
        _id: req.params.id
    }, { $set: {
        name: req.body.name,
        author: req.body.author,
        category: req.body.category,
        status: req.body.status,
        price: req.body.price
    }}, { upsert: true}, (err, product) => {
        if (err) {
            res.send('Xay ra loi khi update');
        } else {
            res.send('cap nhat thanh cong');
        }
    })
})

// Tao 1 san pham moi
productRouter.post('/register', (req,res) => {
    const { error } = productValidate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const newProduct = new ProductModel();
    newProduct.name = req.body.name;
    newProduct.author = req.body.author; 
    newProduct.category = req.body.category;
    newProduct.status = req.body.status;
    newProduct.price = req.body.price;

    newProduct.save((err, product) => {
        if (err) {
            res.send('Err luu thong tin user')
        } else {
            res.send('Them thanh cong san pham');
        }
    });
});
// Xoa 1 san pham
productRouter.delete('/:id', (req,res) => {
    
    ProductModel.findByIdAndDelete({ _id: req.params.id}, (err, product) => {
        if (err) {
            res.send("San pham khong ton tai");
        } else {
            res.send("Da xoa thanh cong");
        }
    })
})

function productValidate(product) {
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        author: Joi.string().min(1).required(),
        category: Joi.string().min(1).required(),
        status: Joi.string().required(),
        price: Joi.number().min(0).required()
    });
    return schema.validate(product);
}

module.exports = productRouter;