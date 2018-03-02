const router = require('express').Router();
const UserModel = require('../models/users');

const getUserMiddleware = (req, res, next) =>
  UserModel.findOne({ _id: req.params.userId }).then((user) => {
    if (!user) return res.boom.notFound();
    req.user = user;
    return next();
  });

router
  .route('/')
  .get(async (req, res) => {
    try {
      const result = await UserModel.find(req.query);
      return res.send(result);
    } catch (err) {
      res.boom.badRequest(err);
    }
  })
  .post(async (req, res) => {
    try {
      const result = await UserModel.create(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.boom.badRequest(err);
    }
  });

router
  .route('/:userId')
  .get(getUserMiddleware, async (req, res) => {
    try {
      res.send(req.user);
    } catch (err) {
      res.boom.badRequest(err);
    }
  })
  .patch(getUserMiddleware, async (req, res) => {
    try {
      Object.assign(req.user, req.body);
      await req.user.save();
      res.send(req.user);
    } catch (err) {
      res.boom.badRequest(err);
    }
  })
  .delete(getUserMiddleware, async (req, res) => {
    try {
      const result = await UserModel.delete({ _id: req.params.userId });
      res.send(result);
    } catch (err) {
      res.boom.badRequest(err);
    }
  });

module.exports = router;
