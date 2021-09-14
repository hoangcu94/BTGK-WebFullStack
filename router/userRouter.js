const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRouter = express.Router();
const UserModel = require('../model/user.model');


userRouter.get('/', (req,res) => {
    res.send('api working');
});

// Lay thong tin tat ca user
userRouter.get('/users', (req, res) => {
    UserModel.find({}).exec((err, users) => {
        if(err) {
            res.send('Khong the lay thong tin User');
        } else {
            res.json(users);
        }
    })
});

// Lay thong tin 1 user
userRouter.get('/:id', (req,res) => {
    UserModel.findOne({
        _id: req.params.id
    }).exec((err, user) => {
        if (err) {
            res.send('Khong tim thay user');
        } else {
            res.json(user);
        }
    });
});

userRouter.post('/register', async (req,res) => {
    // 1. Validate user info
    const { error} = registerValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // 2. Check email exits in db
    const emailExits = await UserModel.findOne({ email: req.body.email});
    if (emailExits) {return res.status(400).send('Email exits in database')};

    // 3. bcryptjs for crypt password
    var salt = bcrypt.genSaltSync(10);
    var hashPassword = bcrypt.hashSync(req.body.password, salt);

    // 4. create new user.
    const newUser = new UserModel();
    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.password = hashPassword;
    newUser.roles = req.body.roles;

    // 5. Return user for client
    try {
        const user = await newUser.save();
        res.send('Tao user thanh cong');
    } catch(error) {
        res.status(400).send(error);
    }
});

// Login vao he thong

userRouter.post('/login', async (req,res) => {
    // 1. Validate user
    const { error} = loginValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // 2. Check email of user exits in database
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email chua ton tai');

    // 3. Check password in database
    const passwordLogin = await bcrypt.compareSync(req.body.password, user.password);
    if (!passwordLogin) res.status(400).send('Password incorrect');

    // 4.generated token string
    const token = jwt.sign({ _id: user._id }, 'chuoi bi mat');

    // 5. Return token for user
    res.header('auth-token', token).send('Ban da dang nhap thanh cong');
});


// Cap nhat thong tin 1 user

userRouter.put('/:id', (req,res) => {
    // 3. bcryptjs for crypt password
    var salt = bcrypt.genSaltSync(10);
    var hashPassword = bcrypt.hashSync(req.body.password, salt);
    //
    UserModel.findByIdAndUpdate({
        _id: req.params.id
    }, { $set: {
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        roles: req.body.roles
    }}, { upsert: true}, (err,user) => {
        if (err) {
            res.send('Xay ra loi update');
        } else {
            res.send(200);
        }
    });
});

// Xoa 1 user
userRouter.delete('/:id', (req, res) => {
    UserModel.findByIdAndDelete({_id: req.params.id}, (err, user) => {
        if(err) {
            res.send("Xay ra loi delete");
        } else {
            res.send(200);
        }
    })
});

// Lay tong so Customer, admin 

userRouter.get('/get/count', (req, res) => {
    UserModel.find({ roles: req.query.roles })
    .exec((err, users) => {
        if (err) {
            res.send("Khong the lay thong tin");
        } else {
            res.json(users);
        }
    })
});

function registerValidate(data) {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().email().min(10).required(),
        password: Joi.string().min(6).required(),
        roles: Joi.string().required()
    });
    return schema.validate(data);
}
function loginValidate(data) {
    const schema = Joi.object({
        email: Joi.string().email().min(10).required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
}

module.exports = userRouter;