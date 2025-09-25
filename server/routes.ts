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
import ConnectPgSimple from "connect-pg-simple";
import { db } from "./db";

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
  // Configure sessions with PostgreSQL store
  const PgSession = ConnectPgSimple(session);
  
  // Require session secret in production
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }

  app.use(session({
    store: new PgSession({
      pool: db,
      tableName: "user_sessions"
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
      const success = await storage.deletePost(req.params.id);
      if (!success) {
        return sendError(res, 404, "Post not found");
      }
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Delete post error:", error);
      sendError(res, 500, "Failed to delete post");
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

  const httpServer = createServer(app);
  return httpServer;
}
