import { Schema, model } from 'mongoose';
import { IMediaDocument, IMediaTitle } from '../types';

const MediaTitle = new Schema<IMediaTitle>(
  {
    contentTitleNative: { type: String, required: true },
    contentTitleRomaji: { type: String },
    contentTitleEnglish: { type: String },
  },
  { _id: false }
);

const MediaSchema = new Schema<IMediaDocument>({
  title: { type: MediaTitle, required: true },
  contentId: { type: String, required: true },
  contentImage: { type: String },
  coverImage: { type: String },
  description: { type: String },
  type: { type: String, required: true },
});

export default model<IMediaDocument>('Media', MediaSchema);
