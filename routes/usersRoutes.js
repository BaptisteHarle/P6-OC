const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usersCtrl');

const userCtrl = new UserController();

router.post('/auth/signup', userCtrl.userSignUp);
router.post('/auth/login', userCtrl.userLogin);

module.exports = router;