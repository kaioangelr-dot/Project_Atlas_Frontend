const router = require('express').Router();
const auth = require('../middlewares/auth');

const {
  getAllUsers,
  getUser,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.use(auth);

router.get('/', getAllUsers);
router.get('/me', getCurrentUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/:id', getUser);

module.exports = router;
