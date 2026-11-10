const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
  getMaps,
  getMap,
  createMap,
  updateMap,
  deleteMap,
  likeMap,
  unlikeMap,
} = require('../controllers/maps');

const mapIdParams = celebrate({
  params: Joi.object({
    mapId: Joi.string().hex().length(24).required(),
  }),
});

const validateImageSource = (value, helpers) => {
  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return value;
    }
  } catch (err) {
    return helpers.error('string.uri');
  }

  return helpers.error('string.uri');
};

const pinPayload = Joi.object({
  id: Joi.number().required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
  name: Joi.string().trim().allow('').default(''),
  description: Joi.string().trim().allow('').default(''),
  photo: Joi.string().allow('').default(''),
});

const drawingPayload = Joi.object({
  id: Joi.number().required(),
  kind: Joi.string().valid('brush', 'eraser').required(),
  size: Joi.number().required(),
  softness: Joi.number().required(),
  points: Joi.array().items(Joi.number()).min(2).required(),
});

const labelPayload = Joi.object({
  id: Joi.number().required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
  text: Joi.string().required(),
  fontSize: Joi.number().required(),
  scaleX: Joi.number().default(1),
  scaleY: Joi.number().default(1),
});

const imagePayload = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().trim().required(),
  src: Joi.string().required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
  width: Joi.number().required(),
  height: Joi.number().required(),
});

const layerPayload = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().trim().required(),
  visible: Joi.boolean().default(true),
  pins: Joi.array().items(pinPayload).default([]),
  drawings: Joi.array().items(drawingPayload).default([]),
  labels: Joi.array().items(labelPayload).default([]),
  images: Joi.array().items(imagePayload).default([]),
});

const mapPayload = {
  name: Joi.string().trim().min(1).max(100),
  image: Joi.string().custom(validateImageSource),
  map: Joi.object({
    layers: Joi.array().items(layerPayload).min(1).required(),
  }),
};

const validateNewMap = celebrate({
  body: Joi.object({
    name: mapPayload.name.required(),
    image: mapPayload.image.required(),
    map: mapPayload.map.required(),
  }),
});

const validateMapUpdate = celebrate({
  body: Joi.object(mapPayload).min(1),
});

router.get('/', getMaps);
router.post('/', auth, validateNewMap, createMap);
router.get('/:mapId', mapIdParams, getMap);
router.patch('/:mapId', auth, mapIdParams, validateMapUpdate, updateMap);
router.delete('/:mapId', auth, mapIdParams, deleteMap);
router.put('/:mapId/likes', auth, mapIdParams, likeMap);
router.delete('/:mapId/likes', auth, mapIdParams, unlikeMap);

module.exports = router;
