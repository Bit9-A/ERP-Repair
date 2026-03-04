import { Request, Response, NextFunction } from "express";
import { SearchService } from "./search.service";
import { AppError } from "../../core/errors/AppError";

const searchService = new SearchService();

export class SearchController {
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (!query) {
        throw new AppError("No search query provided", 400);
      }

      const results = await searchService.globalSearch(query, limit);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
