const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcryptjs = require('bcryptjs');
const User = require('../../model/User');
const auth = require('../../middleware/auth');

const router = express.Router();

// @route GET api/auth
// @desc test route
// @access public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/auth
// @desc authenticate user and get token
// @access public
router.post('/',
  [
    check('email', 'wrong-credentials').isEmail(),
    check('password', 'wrong-credentials').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: [{ msg: 'wrong-credentials' }] });

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: [{ msg: 'wrong-credentials' }] });

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
