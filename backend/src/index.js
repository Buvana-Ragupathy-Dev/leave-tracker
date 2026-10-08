require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Express 4 doesn't catch async errors — patch Router.Layer to forward rejections
const Layer = require('express/lib/router/layer');
const orig = Layer.prototype.handle_request;
Layer.prototype.handle_request = function (req, res, next) {
  if (this.handle?.constructor?.name === 'AsyncFunction') {
    return this.handle(req, res, next).catch(next);
  }
  return orig.call(this, req, res, next);
};

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/leave'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/admin', require('./routes/admin'));

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
