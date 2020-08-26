/* eslint-disable no-console */
const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const Profile = require('../../model/Profile');
const User = require('../../model/User');
const auth = require('../../middleware/auth');

// @route GET api/profile/me
// @desc get current users profile
// @access private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'no profile' });
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route POST api/profile
// @desc create and update user profile
// @access private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is a must have').not().isEmpty(),
      check('skills', 'you need skills').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const profileFields = { user: req.user.id, ...req.body };
    if (profileFields.skills) {
      profileFields.skills = profileFields.skills
        .split(',')
        .map((skill) => skill.trim());
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
      } else {
        profile = new Profile(profileFields);
        await profile.save();
      }

      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route GET api/profile
// @desc get all profiles
// @access public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['avatar', 'name']);
    return res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route GET api/profile/user/:user_id
// @desc get profile by user ID
// @access public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['avatar', 'name']);
    if (!profile) return res.status(400).json({ msg: 'no profile' });
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId')
      return res.status(400).json({ msg: 'no profile' });
    return res.status(500).send('Server Error');
  }
});

// @route DELETE api/profile
// @desc delete profile, user and post
// @access private
router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    return res.json({ msg: 'user deleted' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route PUT api/profile/experience
// @desc add profile experience
// @access private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'title is a myst have').not().isEmpty(),
      check('company', 'company is a myst have').not().isEmpty(),
      check('from', 'from date is a myst have').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const newExp = { ...req.body };
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();

      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc delete profile experience
// @access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
