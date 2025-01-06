import { Schema, model } from 'mongoose';
import {
  IImmersionList,
  IImmersionListItem,
  IImmersionListItemMedia,
} from '../types';

const ImmersionListItemMediaSchema = new Schema<IImmersionListItemMedia>({
  contentTitleNative: { type: String, required: true },
  contentTitleRomaji: { type: String },
  contentImage: { type: String, required: true },
});

const ImmersionListItemSchema = new Schema<IImmersionListItem>({
  contentId: { type: String, required: true },
  contentMedia: { type: ImmersionListItemMediaSchema, required: true },
});

const ImmersionListSchema = new Schema<IImmersionList>({
  manga: { type: [ImmersionListItemSchema], default: [] },
  anime: { type: [ImmersionListItemSchema], default: [] },
  vn: { type: [ImmersionListItemSchema], default: [] },
  video: { type: [ImmersionListItemSchema], default: [] },
  reading: { type: [ImmersionListItemSchema], default: [] },
});

export default model<IImmersionList>('ImmersionList', ImmersionListSchema);
