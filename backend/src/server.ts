import mongoose from 'mongoose';
import { app } from './app';
import { config } from './config';
import { connectDB } from './config/db';
import { Category } from './modules/categories/category.model';
import { CategoryController } from './modules/categories/category.controller';
import { seed } from './scripts/seed';

async function bootstrap() {
  try {
    await connectDB();

    if (!config.isProduction && mongoose.connection.readyState === 1) {
      const count = await Category.countDocuments();
      if (count === 0) {
        console.log('📦 Database is currently empty. Running automated initial seed...');
        await seed(false);
      } else {
        await CategoryController.syncInitialCategories();
      }
    }

    app.listen(config.port, () => {
      console.log('========================================================');
      console.log(`🚀 Biz List Place API Server running in [${config.env}] mode`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🔗 Health Check: http://localhost:${config.port}/api/v1/health`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

bootstrap();
