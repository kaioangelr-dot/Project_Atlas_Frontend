const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    name: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    photo: { type: String, default: '' },
  },
  { _id: false },
);

const drawingSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    kind: { type: String, enum: ['brush', 'eraser'], required: true },
    size: { type: Number, required: true },
    softness: { type: Number, required: true },
    points: { type: [Number], required: true },
  },
  { _id: false },
);

const labelSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: { type: String, required: true },
    fontSize: { type: Number, required: true },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },
  },
  { _id: false },
);

const imageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    src: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

const layerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    visible: { type: Boolean, default: true },
    pins: { type: [pinSchema], default: [] },
    drawings: { type: [drawingSchema], default: [] },
    labels: { type: [labelSchema], default: [] },
    images: { type: [imageSchema], default: [] },
  },
  { _id: false },
);

const mapDataSchema = new mongoose.Schema(
  {
    layers: {
      type: [layerSchema],
      required: true,
      validate: {
        validator: (layers) => layers.length > 0,
        message: 'A map must have at least one layer.',
      },
    },
  },
  { _id: false },
);

const isImageSource = (value) => {
  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

const mapSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    image: {
      type: String,
      required: true,
      validate: { validator: isImageSource },
    },
    map: { type: mapDataSchema, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    likes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('map', mapSchema);
