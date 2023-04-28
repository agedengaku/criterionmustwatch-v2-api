import express from 'express';
import { getFilms } from "../controllers/FilmController";

const router = express.Router();

export default router.get("/", (_, res) => res.end());

router.get("/films", getFilms);