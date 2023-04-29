import { Request, Response } from 'express';
import { getLeavingFilmsWithReviews } from '../services/filmService';

export const getFilms = async (_: Request, res: Response) => {
  const films = await getLeavingFilmsWithReviews();
  
  res.send(films);
};