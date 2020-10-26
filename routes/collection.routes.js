const express = require('express');
const {
    getCollections,
    createCollection,
    collectionsByUser,
    collectionById,
    isCreator,
    updateCollection,
    deleteCollection,
    photo,
    singleCollection,
    like,
    unlike,
    follow,
    unfollow,
    comment,
    uncomment,
    updateComment,
    addBook,
    removeBook,
    findCollections,
    findCollectionsByName
} = require('../controllers/collection.controller');

const { requireSignin } = require('../controllers/auth.controller');
const { userById } = require('../controllers/user.controller');
const { createBookValidator } = require('../validator');

const router = express.Router();

router.get('/collections/:search', findCollections);
router.get('/collections', getCollections);
router.post('/collection/update/:collectionId', requireSignin, isCreator, updateCollection);
router.delete('/collection/delete/:collectionId', requireSignin, isCreator, deleteCollection);

// like unlike
router.put('/collection/like', requireSignin, like);
router.put('/collection/unlike', requireSignin, unlike);

// like unlike
router.put('/collection/follow', requireSignin, follow);
router.put('/collection/unfollow', requireSignin, unfollow);

// comments
router.put('/collection/comment', requireSignin, comment);
router.put('/collection/uncomment', requireSignin, uncomment);

// books
router.put('/collection/book', requireSignin, addBook);
router.put('/collection/unbook', requireSignin, removeBook);
//router.put('/collection/updatecomment', requireSignin, updateComment);

// collections routes
router.post('/collection/new/:userId', requireSignin, createCollection, createBookValidator);
router.get('/collections/by/:userId', requireSignin, collectionsByUser);
router.get('/collections/byName/:search', findCollectionsByName)

router.get('/collection/:collectionId', singleCollection);


// photo
router.get('/collection/photo/:collectionId', photo);
// any route containing :userId, our app will first execute userById()
router.param('userId', userById);
// any route containing :bookId, our app will first execute bookById()
router.param('collectionId', collectionById);

module.exports = router;