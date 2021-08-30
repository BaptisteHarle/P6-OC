const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersCtrl');

const userCtrl = new UserController();

router.post('/signup', userCtrl.userSignUp);
router.post('/login', userCtrl.userLogin);

module.exports = router;