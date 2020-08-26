const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const User = require('../../model/User');

const router = express.Router();

// @route POST api/users
// @desc register user
// @access public
router.post('/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'need valid email').isEmail(),
    check('password', 'min length 6').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ error: [{ msg: 'user already exist' }] });

      const avatar = gravatar.url({
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        ...req.body, avatar,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };
      // after deplay change back to 7200
      jwt.sign(payload, config.get('jwt'), { expiresIn: 720000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  });

module.exports = router;
