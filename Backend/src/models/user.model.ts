import { Schema, model } from 'mongoose';
import { IUser, userRoles } from '../types';
import bcrypt from 'bcryptjs';
import Log from './log.model';
import ImmersionList from './immersionList.model';
import { calculateXp } from '../services/calculateLevel';

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      index: {
        unique: true,
        collation: { locale: 'en', strength: 2 },
      },
    },
    password: { type: String, required: true },
    discordId: { type: String, default: '' },
    stats: {
      userLevel: { type: Number, required: true, default: 1 },
      userXp: { type: Number, required: true, default: 0 },
      userXpToNextLevel: {
        type: Number,
        required: true,
        default: calculateXp(2),
      },
      userXpToCurrentLevel: {
        type: Number,
        required: true,
        default: calculateXp(1),
      },
      readingXp: { type: Number, required: true, default: 0 },
      readingLevel: { type: Number, required: true, default: 1 },
      readingXpToNextLevel: {
        type: Number,
        required: true,
        default: calculateXp(2),
      },
      readingXpToCurrentLevel: {
        type: Number,
        required: true,
        default: calculateXp(1),
      },
      listeningXp: { type: Number, required: true, default: 0 },
      listeningLevel: { type: Number, required: true, default: 1 },
      listeningXpToNextLevel: {
        type: Number,
        required: true,
        default: calculateXp(2),
      },
      listeningXpToCurrentLevel: {
        type: Number,
        required: true,
        default: calculateXp(1),
      },
      charCountVn: { type: Number, required: true, default: 0 },
      charCountLn: { type: Number, required: true, default: 0 },
      readingTimeVn: { type: Number, required: true, default: 0 },
      charCountReading: { type: Number, required: true, default: 0 },
      pageCountLn: { type: Number, required: true, default: 0 },
      readingTimeLn: { type: Number, required: true, default: 0 },
      pageCountManga: { type: Number, required: true, default: 0 },
      charCountManga: { type: Number, required: true, default: 0 },
      readingTimeManga: { type: Number, required: true, default: 0 },
      mangaPages: { type: Number, required: true, default: 0 },
      listeningTime: { type: Number, required: true, default: 0 },
      audioListeningTime: { type: Number, required: true, default: 0 },
      readingTime: { type: Number, required: true, default: 0 },
      outputTime: { type: Number, required: true, default: 0 },
      animeEpisodes: { type: Number, required: true, default: 0 },
      animeWatchingTime: { type: Number, required: true, default: 0 },
      videoWatchingTime: { type: Number, required: true, default: 0 },
    },
    immersionList: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ImmersionList',
    },
    clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
    avatar: { type: String, default: '' },
    banner: { type: String, default: '' },
    titles: { type: [String], default: [], required: true },
    roles: [
      {
        type: String,
        enum: Object.values(userRoles),
        default: userRoles.user,
        required: true,
      },
    ],
    lastImport: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isNew) {
    const immersionList = await ImmersionList.create({});
    this.immersionList = immersionList._id;
  }
  next();
});

UserSchema.pre(
  'findOneAndDelete',
  { document: true, query: false },
  async function (this: IUser, next) {
    console.log('Deleting user logs\nUser id:', this._id);
    await Log.deleteMany({ user: this._id });
    console.log('Deleting user immersion list\nUser id:', this._id);
    await ImmersionList.findByIdAndDelete(this.immersionList);
    next();
  }
);

UserSchema.method(
  'matchPassword',
  async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  }
);

export default model<IUser>('User', UserSchema);
