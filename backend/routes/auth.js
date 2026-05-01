const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: 'influencer' },
});

const Influencer = sequelize.define('Influencer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: DataTypes.UUID,
  referralCode: { type: DataTypes.STRING, unique: true },
  niche: DataTypes.STRING,
});

sequelize.sync({ alter: false });

module.exports.User = User;
module.exports.Influencer = Influencer;

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, niche } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    if (role === 'influencer') {
      const code = name.toUpperCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
      await Influencer.create({ userId: user.id, referralCode: code, niche });
    }

    res.json({ message: 'Registered successfully' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Wrong password' });

    const influencer = user.role === 'influencer'
      ? await Influencer.findOne({ where: { userId: user.id } })
      : null;

    const token = jwt.sign(
      { id: user.id, role: user.role, influencerId: influencer?.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, role: user.role, name: user.name, influencerId: influencer?.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports.router = router;