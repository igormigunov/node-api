const Mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const timestamp = require('mongoose-timestamp');
const bcrypt = require('bcrypt-as-promised');

const userSchema = new Mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  firstname: { type: String, required: true },
  lastname: String,
  email: String,
  phone: String,
  password: { type: String, required: true },
});

const passHook = function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10).then((err, salt) => bcrypt.hash(user.password, salt))
    .then((hash) => {
      user.password = hash;
      next();
    });
};

userSchema.pre('save', passHook);
// userSchema.pre('update', passHook);

userSchema.plugin(mongooseDelete,  { overrideMethods: true, validateBeforeDelete: true });
userSchema.plugin(timestamp);

module.exports = Mongoose.model('User', userSchema);
