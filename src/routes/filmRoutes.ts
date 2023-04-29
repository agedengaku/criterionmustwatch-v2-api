import express from 'express';
import { getFilms } from "../controllers/filmsController";

const router = express.Router();

export default router.get("/", (_, res) => res.end());

router.get("/films", getFilms);