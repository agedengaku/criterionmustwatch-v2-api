import { Request, Response } from 'express';
import { films } from '../services/filmService';

export const getFilms = (_: Request, res: Response) => {
  res.send(films);
};