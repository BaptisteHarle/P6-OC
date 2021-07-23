const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');

const { Schema, model } = mongoose;
const { Types } = Schema;
const {
  user, password, host, name,
} = config.db;

mongoose.connect('mongodb+srv://BaptisteHarle:YkE5uh18qWA9ob1Y@cluster0.0at5y.mongodb.net/soPecko?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  autoIndex: true,
});

const User = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Veuillez renseigner un email',
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/],
  },
  password: {
    type: String,
    required: true,
  },
});

User.pre('save', function (next) {
  const u = this;

  // only hash the password if it has been modified (or is new)
  if (!u.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(config.encrypt.workDifficulty, (err, salt) => {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(u.password, salt, (e, hash) => {
      if (e) return next(e);
      // override the cleartext password with the hashed one
      u.password = hash;
      next();
    });
  });
});

User.methods.comparePassword = function (candidatePassword) {
  return new Promise((fnResolve, fnReject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) {
        fnResolve(false);
      }
      fnResolve(isMatch);
    });
  });
};

module.exports = model('user', User);
