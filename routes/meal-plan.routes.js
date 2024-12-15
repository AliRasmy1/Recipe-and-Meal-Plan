const express = require('express');
const mealPlanController = require('../controllers/meal-plan.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', mealPlanController.getMealPlan);
router.post('/', mealPlanController.createMealPlan);
router.put('/:id', mealPlanController.updateMealPlan);
router.delete('/:id', mealPlanController.deleteMealPlan);

module.exports = router;



