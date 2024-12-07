
import { Request, Response } from "express";
import * as searchService from "../services/search.service";
import logger from "../utils/logger";


export const search = async (req: Request, res: Response) => {
  const { query } = req.body;
  try {
    const results = await searchService.searchUsingAlchemy(query);
    res.json(results);
  } catch (error) {
    logger.error("Error fetching search results:", error);
    res.status(500).json({ error: "Error fetching search results" });
  };
};