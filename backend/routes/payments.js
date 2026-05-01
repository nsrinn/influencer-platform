const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const authMiddleware = require('../middleware/auth');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  influencerId: DataTypes.UUID,
  amount: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  month: DataTypes.STRING,
});

sequelize.sync({ alter: false });
module.exports.Payment = Payment;

router.get('/my', authMiddleware, async (req, res) => {
  const { influencerId } = req.user;
  const payments = await Payment.findAll({ where: { influencerId }, order: [['createdAt', 'DESC']] });
  res.json(payments);
});

router.get('/all', authMiddleware, async (req, res) => {
  const { Influencer, User } = require('./auth');
  const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
  const result = await Promise.all(payments.map(async (p) => {
    const inf = await Influencer.findByPk(p.influencerId);
    const user = inf ? await User.findByPk(inf.userId) : null;
    return { ...p.toJSON(), influencerName: user?.name || 'Unknown' };
  }));
  res.json(result);
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { influencerId, amount, month } = req.body;
    const payment = await Payment.create({ influencerId, amount, month, status: 'pending' });
    res.json(payment);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await Payment.update({ status }, { where: { id: req.params.id } });
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports.router = router;