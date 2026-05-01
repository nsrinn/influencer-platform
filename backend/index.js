require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const paymentsRoutes = require('./routes/payments');
const aiRoutes = require('./routes/ai');

app.use('/auth', authRoutes.router);
app.use('/sales', salesRoutes.router);
app.use('/payments', paymentsRoutes.router);
app.use('/ai', aiRoutes.router);

app.get('/', (req, res) => res.json({ message: 'Influencer Platform API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));