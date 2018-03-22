const Mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const timestamp = require('mongoose-timestamp');
const bcrypt = require('bcrypt-promise');

const userSchema = new Mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  firstname: { type: String, required: true },
  lastname: String,
  email: String,
  phone: String,
  password: { type: String, required: true },
});

function passHook(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10).then(salt => bcrypt.hash(user.password, salt))
    .then((hash) => {
      user.password = hash;
      next();
    });
}
function comparePassword(password) {
  return bcrypt.compare(password, this.password);
}
userSchema.methods.comparePassword = comparePassword;
userSchema.pre('save', passHook);

userSchema.plugin(mongooseDelete, { overrideMethods: true, validateBeforeDelete: true });
userSchema.plugin(timestamp);

module.exports = Mongoose.model('User', userSchema);
