const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    editorial: {
        type: String,
        required: true
    },
    illustrator: {
        type: String
    },
    isbn: {
        type: String,
         unique: true,
         sparse: true
    },
    language: {
        type: String,
        required: true
    },
    year: {
        type: String
    },
    photo: {
        type: String
    },
    urls: [{ type: String }],
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
    comments: [
        {
            text: String,
            created: { type: Date, default: Date.now },
            createdBy: { type: ObjectId, ref: 'User' }
        }
    ]
});

module.exports = mongoose.model('Book', bookSchema);