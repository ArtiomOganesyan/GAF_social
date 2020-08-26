const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../model/User');
const Post = require('../../model/Post');
const Profile = require('../../model/Profile');

// @route post api/posts
// @desc create a post
// @access private
router.post(
  '/',
  [auth, [check('text', 'text is needed').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      return res.json(post);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route get api/posts
// @desc get all posts
// @access private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route get api/posts/:id
// @desc get post by id
// @access private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    return res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ msg: 'post not found' });
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route delete api/posts/:id
// @desc delete a post
// @access private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'user not autherized' });

    await post.remove();
    return res.json({ msg: 'post was deleted' });
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ msg: 'post not found' });
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route put api/posts/like/:id
// @desc like a post
// @access private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'post not found' });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ msg: 'post already liked' });
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ msg: 'post not found' });
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route put api/posts/unlike/:id
// @desc like a post
// @access private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'post not found' });
    console.log(
      post.likes.filter((like) => like.user.toString() === req.user.id).length
    );
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json({ msg: 'post has not been liked' });
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    await post.save();
    res.json(post.likes);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ msg: 'post not found' });
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

// @route post api/posts/comment/:id
// @desc comment an a post
// @access private
router.post(
  '/comment/:id',
  [auth, [check('text', 'text is needed').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.push(newComment);
      await post.save();
      return res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route   delete api/posts/comment/:post_id/:comment_id
// @desc    delete a comment of a post
// @access  private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(400).json({ msg: 'there is no post' });

    const commentToDelete = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!commentToDelete)
      return res.status(400).json({ msg: 'there is no comment' });
    if (commentToDelete.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'no rights' });
    const removeIndex = post.comments
      .map(
        (comment) =>
          comment.user.toString() === req.user.id &&
          comment.id === req.params.comment_id
      )
      .indexOf(true);
    post.comments.splice(removeIndex, 1);
    await post.save();
    return res.json(post.comments);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ msg: 'post not found' });
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
