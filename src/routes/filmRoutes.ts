import express from 'express';
import { getLeavingFilms } from "../controllers/filmsController";

const router = express.Router();

export default router.get("/", (_, res) => res.end());

router.get("/leaving-films", getLeavingFilms);