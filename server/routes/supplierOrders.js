const express = require('express');
const router = express.Router();
const SupplierOrder = require('../models/SupplierOrder');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Middleware to check if user is supplier
const isSupplier = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'supplier') {
      return res.status(403).json({ message: 'Access denied. Supplier only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/supplier-orders:
 *   post:
 *     summary: Create supplier order (Admin only)
 *     tags: [Supplier Orders]
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { supplier, products, totalCost, notes } = req.body;

    const supplierOrder = new SupplierOrder({
      admin: req.user.id,
      supplier,
      products,
      totalCost,
      notes,
    });

    await supplierOrder.save();
    res.status(201).json(supplierOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/supplier-orders/admin/all:
 *   get:
 *     summary: Get all supplier orders (Admin only)
 *     tags: [Supplier Orders]
 */
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await SupplierOrder.find()
      .populate('admin', 'name email')
      .populate('supplier', 'name email')
      .populate('products.product')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/supplier-orders/my-orders:
 *   get:
 *     summary: Get supplier's assigned orders
 *     tags: [Supplier Orders]
 */
router.get('/my-orders', verifyToken, isSupplier, async (req, res) => {
  try {
    const orders = await SupplierOrder.find({ supplier: req.user.id })
      .populate('admin', 'name email')
      .populate('products.product')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/supplier-orders/{id}/status:
 *   put:
 *     summary: Supplier updates order status
 *     tags: [Supplier Orders]
 */
router.put('/:id/status', verifyToken, isSupplier, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await SupplierOrder.findOne({
      _id: req.params.id,
      supplier: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/supplier-orders/{id}/deliver:
 *   put:
 *     summary: Admin marks order as delivered and updates stock
 *     tags: [Supplier Orders]
 */
router.put('/:id/deliver', verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await SupplierOrder.findById(req.params.id).populate('products.product');

    if (!order) {
      return res.status(404).json({ message: 'Supplier order not found' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order already delivered' });
    }

    // Update stock for each product
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'delivered';
    await order.save();

    res.json({ message: 'Stock updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/supplier-orders/suppliers/list:
 *   get:
 *     summary: Get list of all suppliers (Admin only)
 *     tags: [Supplier Orders]
 */
router.get('/suppliers/list', verifyToken, isAdmin, async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'supplier' }).select('name email');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;