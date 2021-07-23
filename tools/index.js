const jwt = require('jsonwebtoken');
const config = require('../config');

const tools = {
  generateAcessToken: (user) => jwt.sign(user, config.jwt.secret, { /* expiresIn: '3600s' */}),
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, config.jwt.secret, (err, user) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  },
};

module.exports = tools;
