import 'dotenv/config';
import app from './app';
import { connectDB } from './db';

connectDB();

app.listen(process.env.PORT);
console.log('🚀 Server on port:', process.env.PORT);
