import { Request, Response, NextFunction } from 'express';
import { Category } from './category.model';
import { Business } from '../businesses/business.model';
import { SearchService } from '../../services/search.service';

// In-memory cache for category listing with business counts
let cachedCategoryList: { data: any[]; timestamp: number } | null = null;
const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class CategoryController {
  static invalidateCache(): void {
    cachedCategoryList = null;
    SearchService.invalidateCategoryCache();
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

      const now = Date.now();
      if (cachedCategoryList && now - cachedCategoryList.timestamp < CATEGORY_CACHE_TTL_MS) {
        res.json({
          success: true,
          data: cachedCategoryList.data,
        });
        return;
      }

      // Execute category lookup and count aggregation in parallel using Promise.all() with covered project
      const [categories, counts] = await Promise.all([
        Category.find({ isActive: true }).sort({ name: 1 }).lean(),
        Business.aggregate([
          { $match: { listingStatus: 'published' } },
          { $project: { categoryIds: 1 } },
          { $unwind: '$categoryIds' },
          { $group: { _id: '$categoryIds', count: { $sum: 1 } } },
        ]),
      ]);

      const countMap = new Map<string, number>();
      counts.forEach((c) => countMap.set(c._id.toString(), c.count));

      const enriched = categories.map((cat) => ({
        ...cat,
        businessCount: countMap.get(cat._id.toString()) || 0,
      }));

      cachedCategoryList = {
        data: enriched,
        timestamp: now,
      };

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=600');
      const { slug } = req.params;
      const category = await Category.findOne({ slug, isActive: true }).lean();

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
        return;
      }

      const count = await Business.countDocuments({
        categoryIds: category._id,
        listingStatus: 'published',
      });

      res.json({
        success: true,
        data: {
          ...category,
          businessCount: count,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBusinessesByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      const { slug } = req.params;
      const category = await Category.findOne({ slug, isActive: true });

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
        return;
      }

      const results = await SearchService.search({
        category: category._id.toString(),
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
        country: req.query.country as string,
        city: req.query.city as string,
        sort: (req.query.sort as any) || 'relevance',
      });

      res.json({
        success: true,
        category,
        ...results,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug, parentId, icon, description, isActive } = req.body;
      const category = await Category.create({
        name,
        slug,
        parentId: parentId || null,
        icon: icon || 'Building2',
        description: description || '',
        isActive: isActive !== false,
      });

      CategoryController.invalidateCache();

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, slug, parentId, icon, description, isActive } = req.body;

      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug.toLowerCase();
      if (parentId !== undefined) updateData.parentId = parentId || null;
      if (icon !== undefined) updateData.icon = icon;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;

      const category = await Category.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
        return;
      }

      CategoryController.invalidateCache();

      res.json({
        success: true,
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
        return;
      }

      CategoryController.invalidateCache();

      res.json({
        success: true,
        message: 'Category deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}
