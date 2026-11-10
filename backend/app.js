require('dotenv').config();

const { PORT = 3000 } = process.env;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { celebrate, Joi, errors } = require('celebrate');
const usersRouter = require('./routes/users');
const mapsRouter = require('./routes/maps');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const validateImageSource = (value, helpers) => {
  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return value;
    }
  } catch (err) {
    return helpers.error('string.uri');
  }

  return helpers.error('string.uri');
};

const validateSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateImageSource),
  }),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

app.use(requestLogger);
app.use(express.json({ limit: '15mb' }));
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

app.post('/signin', validateSignin, login);
app.post('/signup', validateSignup, createUser);

app.use('/users', usersRouter);
app.use('/maps', mapsRouter);

/* prettier-ignore */
app.use((req, res) => res.status(404).send({ message: 'The solicitation was not found' }));

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const { message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'Server error' : message,
  });
});

app.listen(PORT);
