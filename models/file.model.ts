import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'other'],
    required: true,
  },
  bucket: {
    type: String,
    required: true,
  },
  accountId: {
    type: String,
    required: true,
  },
  extension: {
    type: String,
  },
  size: {
    type: Number,
  },
  users: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [],
  },
});

if (process.env.NODE_ENV !== 'production' && mongoose.models.File) {
  delete mongoose.models.File;
}

const File = mongoose.models.File || mongoose.model('File', fileSchema);

export default File;
