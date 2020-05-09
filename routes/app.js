
require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

// bring in routes
const bookRoutes = require('./routes/books.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const collectionRoutes = require('./routes/collection.routes');

//Authentication
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

//Configs

const keys = require("./config/keys");
require("./config/db.config");
require("./config/passport.config").setup(passport);

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: keys.cookieSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.user;
  next();
});



// apiDocs
/* 
app.all('*', function(req, res, next) {
    var origin = req.get('origin'); 
    res.header('Access-Control-Allow-Origin', origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}); */

/* app.get('/', (req, res) => {
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if (err) {
            res.status(400).json({
                error: err
            });
        }
        const docs = JSON.parse(data);
        res.json(docs);
    });
}); */

app.use('/api', bookRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', collectionRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
  });
  
  // error handler
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ message: error.message || "" });
  });
  
app.listen(PORT, (req, res) => console.log(`App listening on port ${PORT}!`));

