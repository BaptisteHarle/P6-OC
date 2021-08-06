const mongoose = require('mongoose');
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

const Sauce = new Schema({
  userId: Types.ObjectId,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: {
    type: Number,
    min: 1,
    max: 10,
  },
  likes: Number,
  dislikes: Number,
  usersLiked: [Types.ObjectId],
  usersDisliked: [Types.ObjectId],
});

module.exports = model('sauce', Sauce);
