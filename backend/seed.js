require('dotenv').config();
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { DataTypes } = require('sequelize');

// Define models inline
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

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  influencerId: DataTypes.UUID,
  amount: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  month: DataTypes.STRING,
});

const influencerData = [
  { name: 'Riya Sharma',   email: 'riya@test.com',   niche: 'Fashion',    code: 'RIYA2024',   sales: [4999,2999,7499,1999,5499,3999,8999,2499,6999,4499], clicks: 420 },
  { name: 'Arjun Mehta',   email: 'arjun@test.com',  niche: 'Tech',       code: 'ARJUN2024',  sales: [9999,4999,12999,3999,8999,6999,14999,5999,10999,7999], clicks: 680 },
  { name: 'Priya Nair',    email: 'priya@test.com',  niche: 'Fitness',    code: 'PRIYA2024',  sales: [2999,1999,4499,999,3499,2499,5999,1499,3999,2999],  clicks: 290 },
  { name: 'Kabir Khan',    email: 'kabir@test.com',  niche: 'Food',       code: 'KABIR2024',  sales: [1999,3499,2999,4999,1499,2999,3999,1999,2499,3999], clicks: 340 },
  { name: 'Sneha Reddy',   email: 'sneha@test.com',  niche: 'Travel',     code: 'SNEHA2024',  sales: [6999,8999,5499,11999,4999,9999,7499,12999,5999,8499], clicks: 510 },
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared and synced');

    const password = await bcrypt.hash('password123', 10);

    // Create admin
    await User.create({
      id: uuidv4(), name: 'Admin Brand', email: 'admin@test.com',
      password, role: 'admin'
    });
    console.log('✅ Admin created  →  admin@test.com / password123');

    // Create influencers + sales + clicks + payments
    for (const inf of influencerData) {
      const userId = uuidv4();
      const influencerId = uuidv4();

      await User.create({ id: userId, name: inf.name, email: inf.email, password, role: 'influencer' });
      await Influencer.create({ id: influencerId, userId, referralCode: inf.code, niche: inf.niche });

      // Sales spread over last 30 days
      for (let i = 0; i < inf.sales.length; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 3));
        await Sale.create({
          id: uuidv4(), influencerId,
          amount: inf.sales[i],
          commission: parseFloat((inf.sales[i] * 0.10).toFixed(2)),
          orderId: Math.floor(Math.random() * 90000 + 10000).toString(),
          date,
        });
      }

      // Clicks
      const ips = ['192.168.1.1','103.21.45.2','45.67.89.10','122.34.56.78','10.0.0.5'];
      for (let i = 0; i < inf.clicks; i++) {
        const ts = new Date();
        ts.setHours(ts.getHours() - Math.floor(Math.random() * 720));
        await Click.create({
          id: uuidv4(), influencerId,
          ip: ips[Math.floor(Math.random() * ips.length)],
          timestamp: ts,
        });
      }

      // Payment record
      const totalCommission = inf.sales.reduce((s, x) => s + x * 0.10, 0);
      await Payment.create({
        id: uuidv4(), influencerId,
        amount: parseFloat(totalCommission.toFixed(2)),
        status: ['pending', 'approved', 'paid'][Math.floor(Math.random() * 3)],
        month: 'April 2025',
      });

      console.log(`✅ ${inf.name}  →  ${inf.email} / password123`);
    }

    console.log('\n🎉 Seed complete! All accounts use password: password123');
    console.log('─────────────────────────────────────────');
    console.log('Admin    →  admin@test.com');
    console.log('Influencer →  riya@test.com  (or arjun, priya, kabir, sneha)');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  }
}

seed();