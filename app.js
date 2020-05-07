const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const helmet = require('helmet');
const expressValidator = require('express-validator');
const fs = require('fs');
const cors = require('cors');
//const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const corsConfig = require('./config/cors.config');
//dotenv.config();


require('./config/db.config');

// bring in routes
const bookRoutes = require('./routes/books.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const collectionRoutes = require('./routes/collection.routes');

// apiDocs
app.get('/', (req, res) => {
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if (err) {
            res.status(400).json({
                error: err
            });
        }
        const docs = JSON.parse(data);
        res.json(docs);
    });
});

// middleware -

app.use(morgan('dev'));
//app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(session({
  secret: 'Super Secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 1000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60
  })
}));

app.use(helmet())
app.use(cors())

app.use('/api', bookRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', collectionRoutes);

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'Unauthorized!' });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`A Node Js API is listening on port: ${port}`);
});

