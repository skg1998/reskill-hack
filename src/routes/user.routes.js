const express = require("express");
const {
    register,
    login,
    verifyUser,
    getUserData
} = require("../controllers/user.controller");

const router = express.Router();

router.get('/register', (req, res, next) => {
    res.render('register', { title: 'Express' });
})

router.get('/login', (req, res, next) => {
    res.render('login', { title: 'Express' });
})

router.post('/register', register);
router.post('/login', login);
router.get('/confirm/:confirmationCode', verifyUser);

//open Api
router.post('/getuser', getUserData);


module.exports = router;