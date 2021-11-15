const wrapper = require('./routes/index');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());


wrapper(app);