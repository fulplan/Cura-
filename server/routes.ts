import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPostSchema,
  insertCategorySchema,
  insertTagSchema,
  insertMediaSchema 
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { db } from "./db";
import multer from "multer";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";

// Helper function for error responses with proper status codes
const sendError = (res: any, status: number, message: string) => {
  res.status(status).json({ error: message });
};

// Helper function to map database errors to proper HTTP status codes
const handleDbError = (error: any, res: any, defaultMessage: string) => {
  if (error instanceof Error) {
    if (error.message.includes("unique")) {
      return sendError(res, 409, "Resource already exists");
    }
    if (error.message.includes("foreign key")) {
      return sendError(res, 422, "Invalid reference");
    }
    if (error.message.includes("not found")) {
      return sendError(res, 404, "Resource not found");
    }
    if (error.message.includes("Validation failed")) {
      return sendError(res, 422, error.message);
    }
  }
  sendError(res, 500, defaultMessage);
};

// Helper function for validation
const validateBody = (schema: z.ZodSchema, body: any) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
};

// Authentication middleware
const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return sendError(res, 401, "Authentication required");
  }
  next();
};

// Admin authorization middleware
const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return sendError(res, 401, "Authentication required");
  }
  if (req.session.user.role !== "admin") {
    return sendError(res, 403, "Admin access required");
  }
  next();
};

// Editor/Admin authorization middleware  
const requireEditor = (req: any, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return sendError(res, 401, "Authentication required");
  }
  if (!["admin", "editor"].includes(req.session.user.role)) {
    return sendError(res, 403, "Editor or admin access required");
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp and random string
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 10 // Maximum 10 files per upload
    },
    fileFilter: (req, file, cb) => {
      // Allow images, videos, audio, and documents
      const allowedTypes = [
        'image/', 'video/', 'audio/',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv', 'application/json'
      ];
      
      const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // Configure sessions with MemoryStore (suitable for serverless)
  const SessionStore = MemoryStore(session);
  
  // Require session secret in production
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }

  app.use(session({
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-for-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "penkora-cms"
    });
  });

  // Simple rate limiting for login attempts
  const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  
  const rateLimitLogin = (req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const resetTime = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    const attempt = loginAttempts.get(ip);
    if (attempt && now - attempt.lastAttempt < resetTime) {
      if (attempt.count >= maxAttempts) {
        return sendError(res, 429, "Too many login attempts. Try again in 15 minutes.");
      }
      attempt.count++;
      attempt.lastAttempt = now;
    } else {
      loginAttempts.set(ip, { count: 1, lastAttempt: now });
    }

    next();
  };

  // Authentication Routes
  app.post("/api/auth/login", rateLimitLogin, async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return sendError(res, 400, "Username and password are required");
      }

      const user = await storage.verifyPassword(username, password);
      if (!user) {
        return sendError(res, 401, "Invalid credentials");
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err: any) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return sendError(res, 500, "Login failed");
        }

        // Store user in new session
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName
        };

        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            return sendError(res, 500, "Login failed");
          }

          // Return user without password
          const { password: _, ...safeUser } = user;
          res.json({ user: safeUser, message: "Login successful" });
        });
      });

    } catch (error) {
      console.error("Login error:", error);
      sendError(res, 500, "Login failed");
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return sendError(res, 500, "Logout failed");
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req: any, res) => {
    if (!req.session?.user) {
      return sendError(res, 401, "Not authenticated");
    }
    res.json({ user: req.session.user });
  });

  // Dashboard & Analytics Routes
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      sendError(res, 500, "Failed to fetch dashboard stats");
    }
  });

  app.get("/api/analytics/popular-posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const posts = await storage.getPopularPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Popular posts error:", error);
      sendError(res, 500, "Failed to fetch popular posts");
    }
  });

  // User Routes (Admin only)
  app.get("/api/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.listUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("List users error:", error);
      sendError(res, 500, "Failed to fetch users");
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = validateBody(insertUserSchema, req.body);
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Create user error:", error);
      handleDbError(error, res, "Failed to create user");
    }
  });

  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return sendError(res, 404, "User not found");
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      sendError(res, 500, "Failed to fetch user");
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const userData = validateBody(insertUserSchema.partial(), req.body);
      const user = await storage.updateUser(req.params.id, userData);
      if (!user) {
        return sendError(res, 404, "User not found");
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Update user error:", error);
      handleDbError(error, res, "Failed to update user");
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return sendError(res, 404, "User not found");
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      sendError(res, 500, "Failed to delete user");
    }
  });

  // Category Routes
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.listCategories();
      res.json(categories);
    } catch (error) {
      console.error("List categories error:", error);
      sendError(res, 500, "Failed to fetch categories");
    }
  });

  app.post("/api/categories", requireEditor, async (req, res) => {
    try {
      const categoryData = validateBody(insertCategorySchema, req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      handleDbError(error, res, "Failed to create category");
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return sendError(res, 404, "Category not found");
      }
      res.json(category);
    } catch (error) {
      console.error("Get category error:", error);
      sendError(res, 500, "Failed to fetch category");
    }
  });

  app.put("/api/categories/:id", requireEditor, async (req, res) => {
    try {
      const categoryData = validateBody(insertCategorySchema.partial(), req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      if (!category) {
        return sendError(res, 404, "Category not found");
      }
      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      sendError(res, 400, error instanceof Error ? error.message : "Failed to update category");
    }
  });

  app.delete("/api/categories/:id", requireEditor, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return sendError(res, 404, "Category not found");
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      sendError(res, 500, "Failed to delete category");
    }
  });

  // Tag Routes
  app.get("/api/tags", async (_req, res) => {
    try {
      const tags = await storage.listTags();
      res.json(tags);
    } catch (error) {
      console.error("List tags error:", error);
      sendError(res, 500, "Failed to fetch tags");
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const tagData = validateBody(insertTagSchema, req.body);
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Create tag error:", error);
      sendError(res, 400, error instanceof Error ? error.message : "Failed to create tag");
    }
  });

  app.get("/api/tags/:id", async (req, res) => {
    try {
      const tag = await storage.getTag(req.params.id);
      if (!tag) {
        return sendError(res, 404, "Tag not found");
      }
      res.json(tag);
    } catch (error) {
      console.error("Get tag error:", error);
      sendError(res, 500, "Failed to fetch tag");
    }
  });

  app.put("/api/tags/:id", async (req, res) => {
    try {
      const tagData = validateBody(insertTagSchema.partial(), req.body);
      const tag = await storage.updateTag(req.params.id, tagData);
      if (!tag) {
        return sendError(res, 404, "Tag not found");
      }
      res.json(tag);
    } catch (error) {
      console.error("Update tag error:", error);
      sendError(res, 400, error instanceof Error ? error.message : "Failed to update tag");
    }
  });

  app.delete("/api/tags/:id", async (req, res) => {
    try {
      const success = await storage.deleteTag(req.params.id);
      if (!success) {
        return sendError(res, 404, "Tag not found");
      }
      res.json({ message: "Tag deleted successfully" });
    } catch (error) {
      console.error("Delete tag error:", error);
      sendError(res, 500, "Failed to delete tag");
    }
  });

  // Post Routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { 
        status, 
        categoryId, 
        authorId, 
        limit = "20", 
        offset = "0",
        detailed = "false" 
      } = req.query;

      const filters = {
        status: status as string,
        categoryId: categoryId as string,
        authorId: authorId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined || filters[key as keyof typeof filters] === "") {
          delete filters[key as keyof typeof filters];
        }
      });

      if (detailed === "true") {
        const posts = await storage.getPostsWithDetails();
        res.json(posts);
      } else {
        const result = await storage.listPosts(filters);
        res.json(result);
      }
    } catch (error) {
      console.error("List posts error:", error);
      sendError(res, 500, "Failed to fetch posts");
    }
  });

  app.post("/api/posts", requireAuth, async (req: any, res) => {
    try {
      const { tags: tagIds, ...postData } = req.body;
      
      // Use authenticated user as author
      const authorId = req.session.user.id;

      const validatedPost = validateBody(insertPostSchema, postData);
      const post = await storage.createPost(validatedPost, authorId, tagIds);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      handleDbError(error, res, "Failed to create post");
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return sendError(res, 404, "Post not found");
      }
      
      // Get associated tags
      const tags = await storage.getPostTags(req.params.id);
      res.json({ ...post, tags });
    } catch (error) {
      console.error("Get post error:", error);
      sendError(res, 500, "Failed to fetch post");
    }
  });

  app.get("/api/posts/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return sendError(res, 404, "Post not found");
      }
      
      // Track view
      await storage.incrementPostViews(post.id);
      await storage.trackEvent("post_view", post.id, "post");
      
      // Get associated tags
      const tags = await storage.getPostTags(post.id);
      res.json({ ...post, tags });
    } catch (error) {
      console.error("Get post by slug error:", error);
      sendError(res, 500, "Failed to fetch post");
    }
  });

  app.put("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const { tags: tagIds, ...postData } = req.body;
      const validatedPost = validateBody(insertPostSchema.partial(), postData);
      const post = await storage.updatePost(req.params.id, validatedPost, tagIds);
      if (!post) {
        return sendError(res, 404, "Post not found");
      }
      res.json(post);
    } catch (error) {
      console.error("Update post error:", error);
      sendError(res, 400, error instanceof Error ? error.message : "Failed to update post");
    }
  });

  app.delete("/api/posts/:id", requireEditor, async (req, res) => {
    try {
      const success = await storage.softDeletePost(req.params.id);
      if (!success) {
        return sendError(res, 404, "Post not found");
      }
      res.json({ message: "Post moved to trash" });
    } catch (error) {
      console.error("Delete post error:", error);
      sendError(res, 500, "Failed to move post to trash");
    }
  });

  app.get("/api/posts/:id/analytics", async (req, res) => {
    try {
      const analytics = await storage.getPostAnalytics(req.params.id);
      if (!analytics) {
        return sendError(res, 404, "Post not found");
      }
      res.json(analytics);
    } catch (error) {
      console.error("Get post analytics error:", error);
      sendError(res, 500, "Failed to fetch post analytics");
    }
  });

  // Media Routes
  app.get("/api/media", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.listMedia(limit, offset);
      res.json(result);
    } catch (error) {
      console.error("List media error:", error);
      sendError(res, 500, "Failed to fetch media");
    }
  });

  // File upload endpoint
  app.post("/api/media/upload", requireAuth, upload.array('files', 10), async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return sendError(res, 400, "No files uploaded");
      }

      const userId = req.session.user.id;
      const uploadedMedia = [];

      for (const file of req.files) {
        const mediaData = {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          alt: req.body.alt || file.originalname,
          caption: req.body.caption || ''
        };

        const media = await storage.createMedia(mediaData, userId);
        uploadedMedia.push(media);
      }

      res.status(201).json({
        message: "Files uploaded successfully",
        files: uploadedMedia
      });
    } catch (error) {
      console.error("File upload error:", error);
      sendError(res, 500, "Failed to upload files");
    }
  });

  app.post("/api/media", async (req, res) => {
    try {
      const { uploadedBy, ...mediaData } = req.body;
      
      if (!uploadedBy) {
        return sendError(res, 400, "Uploaded by user ID is required");
      }

      const validatedMedia = validateBody(insertMediaSchema, mediaData);
      const media = await storage.createMedia(validatedMedia, uploadedBy);
      res.status(201).json(media);
    } catch (error) {
      console.error("Create media error:", error);
      sendError(res, 400, error instanceof Error ? error.message : "Failed to create media");
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const media = await storage.getMedia(req.params.id);
      if (!media) {
        return sendError(res, 404, "Media not found");
      }
      res.json(media);
    } catch (error) {
      console.error("Get media error:", error);
      sendError(res, 500, "Failed to fetch media");
    }
  });

  app.put("/api/media/:id", async (req, res) => {
    try {
      const mediaData = validateBody(insertMediaSchema.partial(), req.body);
      const media = await storage.updateMedia(req.params.id, mediaData);
      if (!media) {
        return sendError(res, 404, "Media not found");
      }
      res.json(media);
    } catch (error) {
      console.error("Update media error:", error);
      sendError(res, 400, error instanceof Error ? error.message : "Failed to update media");
    }
  });

  app.delete("/api/media/:id", async (req, res) => {
    try {
      const success = await storage.deleteMedia(req.params.id);
      if (!success) {
        return sendError(res, 404, "Media not found");
      }
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Delete media error:", error);
      sendError(res, 500, "Failed to delete media");
    }
  });

  // Analytics tracking endpoint
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { type, entityId, entityType, userId, metadata } = req.body;
      
      if (!type) {
        return sendError(res, 400, "Event type is required");
      }

      await storage.trackEvent(type, entityId, entityType, userId, metadata);
      res.json({ message: "Event tracked successfully" });
    } catch (error) {
      console.error("Track event error:", error);
      sendError(res, 500, "Failed to track event");
    }
  });

  // Add missing analytics endpoints
  app.get("/api/posts/:id/analytics", async (req, res) => {
    try {
      const analytics = await storage.getPostAnalytics(req.params.id);
      if (!analytics) {
        return sendError(res, 404, "Post not found");
      }
      res.json(analytics);
    } catch (error) {
      console.error("Get post analytics error:", error);
      sendError(res, 500, "Failed to fetch post analytics");
    }
  });

  // Initialize admin user if none exists
  app.post("/api/setup/init-admin", async (req, res) => {
    try {
      // Check if any admin users exist
      const existingUsers = await storage.listUsers();
      const adminExists = existingUsers.some(user => user.role === "admin");
      
      if (adminExists) {
        return sendError(res, 409, "Admin user already exists");
      }

      const { username, password, email, displayName } = req.body;
      
      if (!username || !password) {
        return sendError(res, 400, "Username and password are required");
      }

      const adminUser = await storage.createUser({
        username,
        password,
        email: email || `${username}@penkora.local`,
        role: "admin",
        displayName: displayName || "Administrator"
      });

      const { password: _, ...safeUser } = adminUser;
      res.status(201).json({ user: safeUser, message: "Admin user created successfully" });
    } catch (error) {
      console.error("Init admin error:", error);
      // Check for unique constraint violations
      if (error instanceof Error && error.message.includes("unique")) {
        return sendError(res, 409, "Username already exists");
      }
      sendError(res, 500, "Failed to create admin user");
    }
  });

  // Trash/Recycle Routes
  
  // Get all deleted posts
  app.get("/api/trash/posts", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.listDeletedPosts(limit, offset);
      res.json(result);
    } catch (error) {
      console.error("List deleted posts error:", error);
      sendError(res, 500, "Failed to fetch deleted posts");
    }
  });

  // Restore a deleted post
  app.post("/api/trash/posts/:id/restore", requireAuth, async (req, res) => {
    try {
      const restored = await storage.restorePost(req.params.id);
      if (!restored) {
        return sendError(res, 404, "Post not found");
      }
      res.json({ message: "Post restored successfully" });
    } catch (error) {
      console.error("Restore post error:", error);
      sendError(res, 500, "Failed to restore post");
    }
  });

  // Permanently delete a post (hard delete from trash)
  app.delete("/api/posts/:id/permanent", requireEditor, async (req, res) => {
    try {
      const deleted = await storage.permanentDeletePost(req.params.id);
      if (!deleted) {
        return sendError(res, 404, "Post not found");
      }
      res.json({ message: "Post permanently deleted" });
    } catch (error) {
      console.error("Permanent delete post error:", error);
      sendError(res, 500, "Failed to permanently delete post");
    }
  });

  // Category trash routes
  app.delete("/api/categories/:id", requireEditor, async (req, res) => {
    try {
      const success = await storage.softDeleteCategory(req.params.id);
      if (!success) {
        return sendError(res, 404, "Category not found");
      }
      res.json({ message: "Category moved to trash" });
    } catch (error) {
      console.error("Delete category error:", error);
      sendError(res, 500, "Failed to move category to trash");
    }
  });

  app.post("/api/trash/categories/:id/restore", requireAuth, async (req, res) => {
    try {
      const restored = await storage.restoreCategory(req.params.id);
      if (!restored) {
        return sendError(res, 404, "Category not found");
      }
      res.json({ message: "Category restored successfully" });
    } catch (error) {
      console.error("Restore category error:", error);
      sendError(res, 500, "Failed to restore category");
    }
  });

  // Tag trash routes
  app.delete("/api/tags/:id", requireEditor, async (req, res) => {
    try {
      const success = await storage.softDeleteTag(req.params.id);
      if (!success) {
        return sendError(res, 404, "Tag not found");
      }
      res.json({ message: "Tag moved to trash" });
    } catch (error) {
      console.error("Delete tag error:", error);
      sendError(res, 500, "Failed to move tag to trash");
    }
  });

  app.post("/api/trash/tags/:id/restore", requireAuth, async (req, res) => {
    try {
      const restored = await storage.restoreTag(req.params.id);
      if (!restored) {
        return sendError(res, 404, "Tag not found");
      }
      res.json({ message: "Tag restored successfully" });
    } catch (error) {
      console.error("Restore tag error:", error);
      sendError(res, 500, "Failed to restore tag");
    }
  });

  // Settings Routes
  
  // Get all settings (admin) or public settings (everyone)
  app.get("/api/settings", async (req: any, res) => {
    try {
      const category = req.query.category as string;
      const publicOnly = !req.session?.user || req.session.user.role !== "admin";
      
      const settings = await storage.getSettings(category, publicOnly);
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      handleDbError(error, res, "Failed to fetch settings");
    }
  });

  // Get a specific setting
  app.get("/api/settings/:key", async (req: any, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return sendError(res, 404, "Setting not found");
      }

      // Check if user can access this setting
      if (!setting.isPublic && (!req.session?.user || req.session.user.role !== "admin")) {
        return sendError(res, 403, "Access denied");
      }

      res.json(setting);
    } catch (error) {
      console.error("Get setting error:", error);
      handleDbError(error, res, "Failed to fetch setting");
    }
  });

  // Create/Update a setting (admin only)
  app.post("/api/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value, category, isPublic, description } = req.body;
      
      if (!key || value === undefined) {
        return sendError(res, 400, "Key and value are required");
      }

      const setting = await storage.setSetting(key, value, category, isPublic, description);
      
      // Reinitialize email service if email settings were changed
      if (category === 'email' || key.startsWith('email') || key.startsWith('smtp') || key.startsWith('from')) {
        await storage.initializeEmailService();
      }
      
      res.json(setting);
    } catch (error) {
      console.error("Set setting error:", error);
      handleDbError(error, res, "Failed to save setting");
    }
  });

  // Update a specific setting (admin only)
  app.put("/api/settings/:key", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const setting = await storage.updateSetting(req.params.key, updates);
      
      if (!setting) {
        return sendError(res, 404, "Setting not found");
      }

      // Reinitialize email service if email settings were changed
      const key = req.params.key;
      if (setting.category === 'email' || key.startsWith('email') || key.startsWith('smtp') || key.startsWith('from')) {
        await storage.initializeEmailService();
      }

      res.json(setting);
    } catch (error) {
      console.error("Update setting error:", error);
      handleDbError(error, res, "Failed to update setting");
    }
  });

  // Delete a setting (admin only)
  app.delete("/api/settings/:key", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteSetting(req.params.key);
      
      if (!deleted) {
        return sendError(res, 404, "Setting not found");
      }

      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Delete setting error:", error);
      handleDbError(error, res, "Failed to delete setting");
    }
  });

  // Email Routes
  
  // Test email configuration
  app.post("/api/email/test", requireAdmin, async (req, res) => {
    try {
      const { emailService } = await import('./services/emailService');
      
      if (!emailService.isConfigured()) {
        return sendError(res, 400, "Email service is not configured");
      }
      
      const testResult = await emailService.testConnection();
      if (!testResult) {
        return sendError(res, 400, "Email connection test failed");
      }
      
      res.json({ message: "Email connection test successful" });
    } catch (error) {
      console.error("Email test error:", error);
      sendError(res, 500, "Failed to test email connection");
    }
  });

  // Send test email
  app.post("/api/email/send-test", requireAdmin, async (req, res) => {
    try {
      const { to } = req.body;
      
      if (!to) {
        return sendError(res, 400, "Recipient email is required");
      }
      
      const { emailService } = await import('./services/emailService');
      
      if (!emailService.isConfigured()) {
        return sendError(res, 400, "Email service is not configured");
      }
      
      const success = await emailService.sendEmail(
        to,
        "Test Email from Penkora CMS",
        "<h2>Test Email</h2><p>This is a test email sent from your CMS to verify the email configuration is working correctly.</p>",
        "Test Email: This is a test email sent from your CMS to verify the email configuration is working correctly."
      );
      
      if (!success) {
        return sendError(res, 500, "Failed to send test email");
      }
      
      res.json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Send test email error:", error);
      sendError(res, 500, "Failed to send test email");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
