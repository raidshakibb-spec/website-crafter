import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertBannerSchema,
  insertPaymentMethodSchema,
  insertTelegramChannelSchema,
  insertSiteSettingSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Configure multer for file uploads
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed."));
  }
};

const upload = multer({
  storage: storage_multer,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// Admin authentication middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Admin authentication routes
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return res.status(500).json({ error: "Admin password not configured" });
    }
    
    if (password === adminPassword) {
      req.session.isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });
  
  app.get("/api/admin/session", (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
  });
  
  // Serve uploaded files
  app.use("/uploads", (await import("express")).default.static(uploadDir));

  // File upload endpoint with error handling (admin only)
  app.post("/api/uploads", requireAdmin, (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ error: "File too large. Maximum size is 50MB." });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || "Invalid file" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    });
  });

  // Delete uploaded file (admin only, with path traversal protection)
  app.delete("/api/uploads/:filename", requireAdmin, (req, res) => {
    try {
      // Sanitize filename - only allow alphanumeric, dash, underscore, and dot
      const filename = path.basename(req.params.filename);
      if (!filename || filename !== req.params.filename || filename.includes("..")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      
      const filePath = path.resolve(uploadDir, filename);
      
      // Ensure the resolved path is within uploadDir (prevent path traversal)
      if (!filePath.startsWith(uploadDir)) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, data);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Banners
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.post("/api/banners", requireAdmin, async (req, res) => {
    try {
      const data = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(data);
      res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create banner" });
    }
  });

  app.patch("/api/banners/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertBannerSchema.partial().parse(req.body);
      const banner = await storage.updateBanner(req.params.id, data);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update banner" });
    }
  });

  app.delete("/api/banners/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteBanner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  // Payment Methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", requireAdmin, async (req, res) => {
    try {
      const data = insertPaymentMethodSchema.parse(req.body);
      const method = await storage.createPaymentMethod(data);
      res.status(201).json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create payment method" });
    }
  });

  app.patch("/api/payment-methods/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertPaymentMethodSchema.partial().parse(req.body);
      const method = await storage.updatePaymentMethod(req.params.id, data);
      if (!method) {
        return res.status(404).json({ error: "Payment method not found" });
      }
      res.json(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deletePaymentMethod(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Payment method not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment method" });
    }
  });

  // Telegram Channels
  app.get("/api/telegram-channels", async (req, res) => {
    try {
      const channels = await storage.getTelegramChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch telegram channels" });
    }
  });

  app.post("/api/telegram-channels", requireAdmin, async (req, res) => {
    try {
      const data = insertTelegramChannelSchema.parse(req.body);
      const channel = await storage.createTelegramChannel(data);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create telegram channel" });
    }
  });

  app.patch("/api/telegram-channels/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertTelegramChannelSchema.partial().parse(req.body);
      const channel = await storage.updateTelegramChannel(req.params.id, data);
      if (!channel) {
        return res.status(404).json({ error: "Telegram channel not found" });
      }
      res.json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update telegram channel" });
    }
  });

  app.delete("/api/telegram-channels/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteTelegramChannel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Telegram channel not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete telegram channel" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const data = insertSiteSettingSchema.parse(req.body);
      const setting = await storage.upsertSetting(data);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  // Translation endpoint (basic Arabic to English)
  const arabicToEnglishMap: Record<string, string> = {
    'إلكترونيات': 'Electronics',
    'ملابس': 'Clothing',
    'أجهزة منزلية': 'Home Appliances',
    'هاتف ذكي متطور': 'Advanced Smartphone',
    'هاتف ذكي بمواصفات عالية وشاشة كبيرة': 'Smartphone with high specs and large screen',
    'سماعات لاسلكية': 'Wireless Headphones',
    'سماعات بلوتوث عالية الجودة مع عزل للضوضاء': 'High quality Bluetooth headphones with noise isolation',
    'ساعة ذكية رياضية': 'Sports Smart Watch',
    'ساعة ذكية لتتبع اللياقة البدنية والصحة': 'Smart watch for fitness and health tracking',
    'حقيبة ظهر عصرية': 'Modern Backpack',
    'حقيبة ظهر أنيقة ومتينة للاستخدام اليومي': 'Elegant and durable backpack for daily use',
    'مكنسة كهربائية ذكية': 'Smart Vacuum Cleaner',
    'روبوت تنظيف ذكي للمنزل': 'Smart home cleaning robot',
    'كاميرا احترافية': 'Professional Camera',
    'كاميرا رقمية للتصوير الاحترافي': 'Digital camera for professional photography',
    'شاشة AMOLED مقاس 6.7 بوصة': '6.7 inch AMOLED display',
    'كاميرا 108 ميجابكسل': '108 megapixel camera',
    'بطارية 5000 مللي أمبير': '5000mAh battery',
    'معالج سريع ثماني النواة': 'Fast octa-core processor',
    'عزل نشط للضوضاء': 'Active noise cancellation',
    'عمر بطارية 30 ساعة': '30 hours battery life',
    'صوت محيطي': 'Surround sound',
    'مقاومة للماء': 'Water resistant',
    'تتبع معدل ضربات القلب': 'Heart rate tracking',
    'GPS مدمج': 'Built-in GPS',
    'مقاومة للماء حتى 50 متر': 'Water resistant up to 50 meters',
    'شاشة Always-On': 'Always-On display',
    'مساحة واسعة للكمبيوتر المحمول': 'Spacious laptop compartment',
    'جيوب متعددة': 'Multiple pockets',
    'تصميم مريح للظهر': 'Ergonomic back design',
    'تحكم عبر التطبيق': 'App control',
    'رسم خرائط ذكي': 'Smart mapping',
    'شفط قوي': 'Strong suction',
    'عمر بطارية طويل': 'Long battery life',
    'دقة 50 ميجابكسل': '50 megapixel resolution',
    'تصوير فيديو 4K': '4K video recording',
    'عدسة قابلة للتبديل': 'Interchangeable lens',
    'شاشة قابلة للدوران': 'Rotatable screen',
  };

  app.post("/api/translate", async (req, res) => {
    try {
      const { texts } = req.body as { texts: string[] };
      if (!Array.isArray(texts)) {
        return res.status(400).json({ error: "texts must be an array" });
      }
      
      const translated = texts.map(text => {
        if (!text) return text;
        return arabicToEnglishMap[text] || text;
      });
      
      res.json({ translations: translated });
    } catch (error) {
      res.status(500).json({ error: "Translation failed" });
    }
  });

  return httpServer;
}
