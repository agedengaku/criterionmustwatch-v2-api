import express from 'express';
import filmRoutes from './routes/filmRoutes';

const app = express();

app.use('/', filmRoutes);

const {
  PORT = process.env.PORT || 3000,
} = process.env;

app.listen(PORT, () => {
  console.log('server started at http://localhost:' + PORT);
});