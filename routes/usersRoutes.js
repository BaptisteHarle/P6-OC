const express = require('express');
const router = express.Router();
const usersCtrl = require('../controllers/usersCtrl');

router.post('/signup', usersCtrl.userLogin);
router.post('/login', usersCtrl.userLogin);

module.exports = router;