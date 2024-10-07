import { Schema, model } from 'mongoose';
import { ILog, IEditedFields } from '../types';

const LogSchema = new Schema<ILog>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, required: true },
    contentId: { type: Schema.Types.ObjectId, required: false },
    xp: { type: Number, required: true },
    private: { type: Boolean, default: false },
    adult: { type: Boolean, default: false },
    image: String,
    description: { type: String, trim: true, required: true },
    editedFields: { type: {} as IEditedFields, default: null },
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
  ref: function (this: ILog) {
    if (this.type === 'anime') return 'Anime';
    if (this.type === 'manga') return 'Manga';
    if (this.type === 'reading') return 'LightNovel';
    if (this.type === 'vn') return 'VisualNovel';
    return null;
  },
  localField: 'contentId',
  foreignField: '_id',
  justOne: true,
});

export default model<ILog>('Log', LogSchema);
