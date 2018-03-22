const router = require('express').Router();
const { celebrate } = require('celebrate');
const jwt = require('jsonwebtoken');
const validators = require('../../validators/users');
const UserModel = require('../../models/users');

router
  .route('/')
  .post(celebrate(validators.post), async (req, res) => {
    try {
      const result = await UserModel.create(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.boom.badRequest(err);
    }
  });
router
  .route('/auth')
  .post(celebrate(validators.postAuth), async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await UserModel.findOne({ username });
      if (!user) res.boom.notFound();
      const resP = await user.comparePassword(password);
      if (!resP) return res.boom.unauthorized();
      const token = jwt.sign(user.toObject(), process.env.JWT_SECRET);
      res.send({ token });
    } catch (err) {
      res.boom.badRequest(err);
    }
  });
module.exports = router;
