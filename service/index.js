import express from 'express';
import dotenv from 'dotenv';
import initApp from './app/app.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
initApp(app);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));