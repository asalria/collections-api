const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const messageSchema = new mongoose.Schema({
   sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
   },
   receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
   },
   message: {
       type: String,
       required: ['true','A description of the route is required']
   },
   route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
   },
   created: {
       type: Date
   }
},{
   timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;