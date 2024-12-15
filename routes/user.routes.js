const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/:id', userController.getUserProfile);

router.use(authMiddleware);

router.put('/profile', userController.updateProfile);
router.post('/follow/:id', userController.followUser);
router.post('/unfollow/:id', userController.unfollowUser);
router.post('/save-recipe/:recipeId', userController.saveRecipe);
router.post('/unsave-recipe/:recipeId', userController.unsaveRecipe);

module.exports = router;