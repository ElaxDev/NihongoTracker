import { Schema, model, Types } from 'mongoose';
import { IImmersionList } from '../types';

const ImmersionListSchema = new Schema<IImmersionList>({
  manga: { type: [Types.ObjectId], default: [] },
  anime: { type: [Types.ObjectId], default: [] },
  vn: { type: [Types.ObjectId], default: [] },
  video: { type: [Types.ObjectId], default: [] },
  reading: { type: [Types.ObjectId], default: [] },
});

export default model<IImmersionList>('ImmersionList', ImmersionListSchema);
