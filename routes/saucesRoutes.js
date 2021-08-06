const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauceCtrl');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.get('', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.updateSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likes);

module.exports = router;