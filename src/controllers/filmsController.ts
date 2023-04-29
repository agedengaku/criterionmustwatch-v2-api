import { Request, Response } from 'express';
import { getFilmData } from '../services/filmService';

export const getFilms = async (_: Request, res: Response) => {
  const films = await getFilmData();
  res.send(films);
};