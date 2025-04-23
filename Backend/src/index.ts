import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db.js';

connectDB();

app.listen(process.env.PORT);
console.log('🚀 Server on port:', process.env.PORT);
