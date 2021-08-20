const express = require('express');
const router = express.Router();
const SauceController = require('../controllers/saucesCtrl');
const { auth, multerMiddleware } = require('../middlewares');

const sauceCtrl = new SauceController();

router.get('/sauces', auth, sauceCtrl.getAllSauces);
router.get('/sauces/:id', auth, sauceCtrl.getOneSauce);
router.post('/sauces', auth, multerMiddleware, sauceCtrl.createSauce);
router.put('/sauces/:id', auth, multerMiddleware, sauceCtrl.updateSauce);
router.delete('/sauces/:id', auth, sauceCtrl.deleteSauce);
router.post('/sauces/:id/like', auth, sauceCtrl.likes);

module.exports = router;