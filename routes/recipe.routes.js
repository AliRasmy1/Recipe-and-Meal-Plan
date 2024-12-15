const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', recipeController.getAllRecipes);
router.get('/search', recipeController.searchRecipes);

router.use(authMiddleware);

router.post('/', recipeController.createRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);
router.post('/:id/like', recipeController.likeRecipe);
router.post('/:id/comment', recipeController.addComment);
router.post('/:id/rate', recipeController.addRating);

router.get('/:id', recipeController.getRecipeById); 


module.exports = router;