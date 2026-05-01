const express = require('express');
const router = express.Router();
const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const authMiddleware = require('../middleware/auth');

const Sale = sequelize.define('Sale', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  influencerId: DataTypes.UUID,
  amount: DataTypes.FLOAT,
  commission: DataTypes.FLOAT,
  orderId: DataTypes.STRING,
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const Click = sequelize.define('Click', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  influencerId: DataTypes.UUID,
  ip: DataTypes.STRING,
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

sequelize.sync({ alter: false });

module.exports.Sale = Sale;
module.exports.Click = Click;

// Track click via referral link
router.get('/track', async (req, res) => {
  const { ref } = req.query;
  const { Influencer } = require('./auth');
  const influencer = await Influencer.findOne({ where: { referralCode: ref } });
  if (influencer) {
    await Click.create({ influencerId: influencer.id, ip: req.ip });
  }
  res.redirect('https://www.google.com'); // replace with real product URL
});

// Record a sale
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { influencerId, amount, orderId } = req.body;
    const commission = parseFloat((amount * 0.10).toFixed(2));
    const sale = await Sale.create({ influencerId, amount, commission, orderId });
    res.json(sale);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get sales stats for one influencer
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { influencerId } = req.user;
    const sales = await Sale.findAll({ where: { influencerId }, order: [['date', 'DESC']] });
    const clicks = await Click.count({ where: { influencerId } });
    const totalRevenue = sales.reduce((s, x) => s + x.amount, 0);
    const totalCommission = sales.reduce((s, x) => s + x.commission, 0);
    const conversionRate = clicks > 0 ? ((sales.length / clicks) * 100).toFixed(1) : 0;
    res.json({ sales, clicks, totalRevenue, totalCommission, conversionRate, conversions: sales.length });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: all sales
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const sales = await Sale.findAll({ order: [['date', 'DESC']] });
    const { Influencer, User } = require('./auth');
    const result = await Promise.all(sales.map(async (s) => {
      const inf = await Influencer.findByPk(s.influencerId);
      const user = inf ? await User.findByPk(inf.userId) : null;
      return { ...s.toJSON(), influencerName: user?.name || 'Unknown', referralCode: inf?.referralCode };
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: top influencers
router.get('/top-influencers', authMiddleware, async (req, res) => {
  try {
    const { Influencer, User } = require('./auth');
    const influencers = await Influencer.findAll();
    const stats = await Promise.all(influencers.map(async (inf) => {
      const user = await User.findByPk(inf.userId);
      const sales = await Sale.findAll({ where: { influencerId: inf.id } });
      const clicks = await Click.count({ where: { influencerId: inf.id } });
      const revenue = sales.reduce((s, x) => s + x.amount, 0);
      const commission = sales.reduce((s, x) => s + x.commission, 0);
      return {
        id: inf.id, name: user?.name, referralCode: inf.referralCode,
        revenue, commission, sales: sales.length, clicks,
        conversionRate: clicks > 0 ? ((sales.length / clicks) * 100).toFixed(1) : 0
      };
    }));
    res.json(stats.sort((a, b) => b.revenue - a.revenue));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports.router = router;