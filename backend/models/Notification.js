const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'post:create',
      'post:like',
      'post:react',
      'post:comment',
      'post:share',
      'comment:like',
      'reply:create',
      'reply:like',
      'friend:request',
      'friend:accept'
    ],
    required: true
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  commentId: { type: String },
  replyId: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

