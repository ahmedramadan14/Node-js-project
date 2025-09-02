require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const apiLimiter = require('./middlewares/rateLimit');
const errorHandler = require('./middlewares/error');
const { ensureFirstAdmin } = require('./controllers/auth.controller');

const app = express();
connectDB().then(ensureFirstAdmin).catch(()=>{});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', apiLimiter);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/posts', require('./routes/post.routes'));

app.get('/', (req, res) => res.send('API is running'));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
