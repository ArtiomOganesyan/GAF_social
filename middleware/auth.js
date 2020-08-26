const jsonwebtoken = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.header('jwtToken');

  if (!token) return res.status(401).json({ msg: 'no token' });

  try {
    const decoded = jsonwebtoken.verify(token, config.get('jwt'));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'token is not valid' });
  }
};
