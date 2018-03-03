const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const userJoiObject = Joi.object({
  username: Joi.string(),
  firstname: Joi.string(),
  lastname: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  password: Joi.string(),
}).options({ stripUnknown: true });

module.exports = {
  getlist: {
    query: userJoiObject,
  },
  post: {
    body: userJoiObject.requiredKeys(['username', 'firstname', 'password']),
  },
  processOne: {
    params: Joi.object({
      userId: Joi.objectId(),
    }).options({ stripUnknown: true }),
  },
  patchOne: {
    params: Joi.object({
      userId: Joi.objectId(),
    }).options({ stripUnknown: true }),
    body: userJoiObject,
  },
  postAuth: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
};
