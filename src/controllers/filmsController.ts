import { Request, Response } from 'express';
import { getSortedLeavingFilmsCollectionWithReviews } from '../services/filmService';

export const getLeavingFilms = async (_: Request, res: Response) => {
  const films = await getSortedLeavingFilmsCollectionWithReviews();

  res.send(films);
};