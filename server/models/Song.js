const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  singer: { type: String, required: true },
  album: { type: String, default: 'Single' },
  genre: { type: String, default: 'Pop' },
  duration: { type: Number, default: 0 },
  releaseDate: { type: Date, default: Date.now },
  path: { type: String, required: true },
  image: { type: String, default: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music%20album%20cover%20art%20dark%20theme&image_size=square_hd' },
  plays: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Song', songSchema);
