import { Schema, model } from 'mongoose';
import { ILog, IEditedFields } from '../types.js';

const editedFieldsSchema = new Schema<IEditedFields>(
  {
    episodes: { type: Number },
    pages: { type: Number },
    chars: { type: Number },
    time: { type: Number },
    xp: { type: Number },
  },
  { _id: false }
);

const LogSchema = new Schema<ILog>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, required: true },
    mediaId: { type: String, required: false },
    xp: { type: Number, required: true },
    private: { type: Boolean, default: false },
    adult: { type: Boolean, default: false },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    editedFields: { type: editedFieldsSchema, default: null },
    episodes: {
      type: Number,
      required: function (this: ILog) {
        return this.type === 'anime';
      },
    },
    pages: {
      type: Number,
      required: function (this: ILog) {
        return (
          (!this.chars && this.type === 'manga') ||
          (!this.chars && !this.time && this.type === 'reading')
        );
      },
    },
    time: {
      type: Number,
      required: function (this: ILog) {
        return (
          (!this.chars &&
            ((this.type === 'reading' && !this.pages) || this.type === 'vn')) ||
          this.type === 'video' ||
          this.type === 'audio' ||
          this.type === 'other'
        );
      },
    },
    chars: {
      type: Number,
      required: function (this: ILog) {
        return (
          (!this.time && this.type === 'vn') ||
          (!this.time && !this.pages && this.type === 'reading') ||
          (!this.pages && this.type === 'manga')
        );
      },
    },
    date: { type: Date, default: new Date(), required: true },
  },
  { timestamps: true }
);

LogSchema.virtual('media', {
  ref: 'Media',
  localField: 'mediaId',
  foreignField: 'contentId',
  justOne: true,
});

export default model<ILog>('Log', LogSchema);
