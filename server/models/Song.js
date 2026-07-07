const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  id: String,
  name: String,
  singer: String,
  path: String,
  image: String
});

module.exports = mongoose.model('Song', songSchema);
