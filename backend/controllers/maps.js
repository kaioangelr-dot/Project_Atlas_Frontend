const Map = require('../models/map');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

const GUEST_USER_ID = '3';

function handleMapError(err, next) {
  if (err.name === 'DocumentNotFoundError') {
    return next(new NotFoundError('Map not found'));
  }
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return next(new BadRequestError('Invalid map data'));
  }
  return next(err);
}

function ensureCanModifyMap(map, req) {
  if (
    req.user
    && (!map.owner || map.owner.toString() !== req.user._id)
  ) {
    throw new ForbiddenError('You have no permission to modify this map');
  }
}

module.exports.getMaps = (req, res, next) => {
  Map.find({})
    .sort({ createdAt: -1 })
    .then((maps) => res.send(maps))
    .catch(next);
};

module.exports.getMap = (req, res, next) => {
  Map.findById(req.params.mapId)
    .orFail()
    .then((map) => res.send(map))
    .catch((err) => handleMapError(err, next));
};

module.exports.createMap = (req, res, next) => {
  const { name, image, map } = req.body;

  Map.create({
    name,
    image,
    map,
    owner: req.user ? req.user._id : undefined,
  })
    .then((createdMap) => res.status(201).send(createdMap))
    .catch((err) => handleMapError(err, next));
};

module.exports.updateMap = (req, res, next) => {
  const { name, image, map: mapData } = req.body;

  Map.findById(req.params.mapId)
    .orFail()
    .then((map) => {
      ensureCanModifyMap(map, req);
      if (name !== undefined) map.set('name', name);
      if (image !== undefined) map.set('image', image);
      if (mapData !== undefined) map.set('map', mapData);
      return map.save();
    })
    .then((updatedMap) => res.send(updatedMap))
    .catch((err) => handleMapError(err, next));
};

module.exports.deleteMap = (req, res, next) => {
  Map.findById(req.params.mapId)
    .orFail()
    .then((map) => {
      ensureCanModifyMap(map, req);
      return map.deleteOne();
    })
    .then(() => res.status(204).end())
    .catch((err) => handleMapError(err, next));
};

module.exports.likeMap = (req, res, next) => {
  const userId = String((req.user && req.user._id) || GUEST_USER_ID);

  Map.findByIdAndUpdate(
    req.params.mapId,
    { $addToSet: { likes: userId } },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((map) => res.send(map))
    .catch((err) => handleMapError(err, next));
};

module.exports.unlikeMap = (req, res, next) => {
  const userId = String((req.user && req.user._id) || GUEST_USER_ID);

  Map.findByIdAndUpdate(
    req.params.mapId,
    { $pull: { likes: userId } },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((map) => res.send(map))
    .catch((err) => handleMapError(err, next));
};
