import express from 'express';
import User from '../models/User.js';
import { authenticateOrDemo } from '../middleware/mongoAuth.js';

const router = express.Router();

// GET /api/categories/custom or /api/v1/categories/custom
const getCustomCategoriesHandler = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const categories = user.customCategories || [];
    // Support both direct array format and { success, categories } envelope
    res.json(categories);
  } catch (err) {
    console.error('[Categories GET Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
};

router.get('/', authenticateOrDemo, getCustomCategoriesHandler);
router.get('/custom', authenticateOrDemo, getCustomCategoriesHandler);

// POST /api/categories/custom
const addCustomCategoryHandler = async (req, res) => {
  try {
    const { name, type = 'EXPENSE', color = '#10b981', icon = 'Tag' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = {
      name: name.trim(),
      type: type.toUpperCase(),
      color: color.trim() || '#10b981',
      icon: icon.trim() || 'Tag',
      createdAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { customCategories: newCategory } },
      { new: true }
    );

    const created = user.customCategories[user.customCategories.length - 1];
    res.status(201).json(created);
  } catch (err) {
    console.error('[Categories POST Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to add custom category' });
  }
};

router.post('/', authenticateOrDemo, addCustomCategoryHandler);
router.post('/custom', authenticateOrDemo, addCustomCategoryHandler);

// DELETE /api/categories/custom/:id
const deleteCustomCategoryHandler = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { customCategories: { _id: req.params.id } },
    });
    res.json({ success: true, message: 'Custom category removed' });
  } catch (err) {
    console.error('[Categories DELETE Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
};

router.delete('/:id', authenticateOrDemo, deleteCustomCategoryHandler);
router.delete('/custom/:id', authenticateOrDemo, deleteCustomCategoryHandler);

export default router;
