const express = require('express');
const User = require('../schema/User');

const router = express.Router();
const tools = require('../tools');

/* Point d'api qui renvois toutes les utilisateurs de la BDD */

router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = new User({
      email,
      password,
    });

    await user.save();
    res.json({ message: 'utilisateur crée' });
  } catch (error) {
    res.json(error);
  }
});

/* Point d'api pour la connection d'un utilisateur */

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && await user.comparePassword(password)) {
    res.json({
      userId: user._id,
      token: tools.generateAcessToken({
        userId: user._id,
        email: user.email,
      }),
    });
    /* On permet a l'utilisateur de récuperer son user_Id via le token */
  } else {
    res.status(403).json({ userId: null, token: null, message: 'Identifiants incorrects' });
  }
});

module.exports = router;
