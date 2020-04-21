const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Book = require("./book.model");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    owner: {
        type: String,
        trim: true,
        required: true
    },
    createdBy: {
        type: ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    likes: [{ type: ObjectId, ref: 'User' }],
    about: {
        type: String,
        trim: true
    },
    books: [{ type: ObjectId, ref: "Book" }]
});

/**
 * Virtual fields are additional fields for a given model.
 * Their values can be set manually or automatically with defined functionality.
 * Keep in mind: virtual properties (password) don’t get persisted in the database.
 * They only exist logically and are not written to the document’s collection.
 */



module.exports = mongoose.model("Collection", userSchema);