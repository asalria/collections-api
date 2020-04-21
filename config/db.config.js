const mongoose = require('mongoose');
const DB_NAME = 'collection';
//const MONGO_URI = `mongodb://localhost/${DB_NAME}`;

mongoose.Promise = Promise;


mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  })
  .then(() => {
    console.log(`Connected to ${DB_NAME} database.`);
  }).catch((error) => {
    console.error(`Database connection error: ${error}`);
  });