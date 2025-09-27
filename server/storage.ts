import { 
  type User, type InsertUser,
  type Post, type InsertPost,
  type Category, type InsertCategory,
  type Tag, type InsertTag,
  type Media, type InsertMedia,
  type Analytics,
  type Setting, type InsertSetting,
  type Section, type InsertSection,
  users, posts, categories, tags, media, analytics, postTags, settings, sections
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Complete storage interface for CMS
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  listUsers(): Promise<User[]>;
  verifyPassword(username: string, password: string): Promise<User | null>;

  // Posts
  createPost(post: InsertPost, authorId: string, tagIds?: string[]): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  updatePost(id: string, post: Partial<InsertPost>, tagIds?: string[]): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  softDeletePost(id: string): Promise<boolean>;
  restorePost(id: string): Promise<boolean>;
  listPosts(filters?: { status?: string; categoryId?: string; authorId?: string; limit?: number; offset?: number; includeDeleted?: boolean }): Promise<{ posts: Post[]; total: number }>;
  listDeletedPosts(limit?: number, offset?: number): Promise<{ posts: Post[]; total: number }>;
  getPostsWithDetails(): Promise<any[]>;
  incrementPostViews(id: string): Promise<void>;

  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  softDeleteCategory(id: string): Promise<boolean>;
  restoreCategory(id: string): Promise<boolean>;
  listCategories(includeDeleted?: boolean): Promise<Category[]>;
  listDeletedCategories(): Promise<Category[]>;

  // Tags
  createTag(tag: InsertTag): Promise<Tag>;
  getTag(id: string): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: string): Promise<boolean>;
  softDeleteTag(id: string): Promise<boolean>;
  restoreTag(id: string): Promise<boolean>;
  listTags(includeDeleted?: boolean): Promise<Tag[]>;
  listDeletedTags(): Promise<Tag[]>;
  getPostTags(postId: string): Promise<Tag[]>;

  // Media
  createMedia(media: InsertMedia, uploadedBy: string): Promise<Media>;
  getMedia(id: string): Promise<Media | undefined>;
  updateMedia(id: string, media: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  softDeleteMedia(id: string): Promise<boolean>;
  restoreMedia(id: string): Promise<boolean>;
  listMedia(limit?: number, offset?: number, includeDeleted?: boolean): Promise<{ media: Media[]; total: number }>;
  listDeletedMedia(limit?: number, offset?: number): Promise<{ media: Media[]; total: number }>;

  // Analytics
  trackEvent(type: string, entityId?: string, entityType?: string, userId?: string, metadata?: any): Promise<void>;
  getDashboardStats(): Promise<any>;
  getPostAnalytics(postId: string): Promise<any>;
  getPopularPosts(limit?: number): Promise<any[]>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: any, category?: string, isPublic?: boolean, description?: string): Promise<Setting>;
  getSettings(category?: string, publicOnly?: boolean): Promise<Setting[]>;
  deleteSetting(key: string): Promise<boolean>;
  updateSetting(key: string, updates: Partial<InsertSetting>): Promise<Setting | undefined>;

  // Search
  searchContent(query: string, type?: string, limit?: number): Promise<{ results: any[]; total: number }>;
  
  // Sections
  createSection(section: InsertSection, createdBy: string): Promise<Section>;
  getSection(id: string): Promise<Section | undefined>;
  updateSection(id: string, section: Partial<InsertSection>): Promise<Section | undefined>;
  deleteSection(id: string): Promise<boolean>;
  softDeleteSection(id: string): Promise<boolean>;
  restoreSection(id: string): Promise<boolean>;
  listSections(pageId?: string, includeDeleted?: boolean): Promise<Section[]>;
  reorderSections(sectionIds: string[]): Promise<boolean>;
  
  // Email service initialization
  initializeEmailService(): Promise<void>;
}

export class PostgreSQLStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const userData = { ...user, password: hashedPassword };
    
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if it's being updated
    const updateData = { ...user, updatedAt: new Date() };
    if (user.password) {
      updateData.password = await bcrypt.hash(user.password, 12);
    }
    
    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.length > 0;
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.createdAt));
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Posts
  async createPost(post: InsertPost, authorId: string, tagIds?: string[]): Promise<Post> {
    // Create the post first
    const result = await db.insert(posts).values({ ...post, authorId }).returning();
    const createdPost = result[0];

    // Associate tags if provided (Neon HTTP driver doesn't support transactions)
    if (tagIds && tagIds.length > 0) {
      const tagAssociations = tagIds.map(tagId => ({
        postId: createdPost.id,
        tagId
      }));
      await db.insert(postTags).values(tagAssociations);
    }

    return createdPost;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts)
      .where(and(eq(posts.id, id), sql`${posts.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const result = await db.select().from(posts)
      .where(and(eq(posts.slug, slug), sql`${posts.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async updatePost(id: string, post: Partial<InsertPost>, tagIds?: string[]): Promise<Post | undefined> {
    // Update the post first
    const result = await db.update(posts).set({ ...post, updatedAt: new Date() }).where(eq(posts.id, id)).returning();
    
    if (result.length > 0 && tagIds !== undefined) {
      // Remove existing tag associations (Neon HTTP driver doesn't support transactions)
      await db.delete(postTags).where(eq(postTags.postId, id));
      
      // Add new tag associations
      if (tagIds.length > 0) {
        const tagAssociations = tagIds.map(tagId => ({
          postId: id,
          tagId
        }));
        await db.insert(postTags).values(tagAssociations);
      }
    }

    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    // Soft delete by default for safety
    return this.softDeletePost(id);
  }

  // Hard delete for permanent removal (use with extreme caution)
  async permanentDeletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.length > 0;
  }

  async softDeletePost(id: string): Promise<boolean> {
    const result = await db.update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result.length > 0;
  }

  async restorePost(id: string): Promise<boolean> {
    const result = await db.update(posts)
      .set({ deletedAt: null })
      .where(eq(posts.id, id))
      .returning();
    return result.length > 0;
  }

  async listPosts(filters?: { status?: string; categoryId?: string; authorId?: string; limit?: number; offset?: number; includeDeleted?: boolean }): Promise<{ posts: Post[]; total: number }> {
    const conditions = [];
    
    // Exclude soft-deleted posts by default
    if (!filters?.includeDeleted) {
      conditions.push(sql`${posts.deletedAt} IS NULL`);
    }
    
    if (filters?.status) {
      conditions.push(eq(posts.status, filters.status));
    }
    if (filters?.categoryId) {
      conditions.push(eq(posts.categoryId, filters.categoryId));
    }
    if (filters?.authorId) {
      conditions.push(eq(posts.authorId, filters.authorId));
    }

    const whereClause = conditions.length === 0 ? undefined : 
      conditions.length === 1 ? conditions[0] : and(...conditions);

    // Build queries
    const baseQuery = db.select().from(posts);
    const countBaseQuery = db.select({ count: count() }).from(posts);

    const finalQuery = whereClause ? baseQuery.where(whereClause) : baseQuery;
    const finalCountQuery = whereClause ? countBaseQuery.where(whereClause) : countBaseQuery;

    const orderedQuery = finalQuery.orderBy(desc(posts.createdAt));
    
    const limitedQuery = filters?.limit ? orderedQuery.limit(filters.limit) : orderedQuery;
    const finalPaginatedQuery = filters?.offset ? limitedQuery.offset(filters.offset) : limitedQuery;

    const [postsResult, totalResult] = await Promise.all([
      finalPaginatedQuery,
      finalCountQuery
    ]);

    return {
      posts: postsResult,
      total: totalResult[0].count as number
    };
  }

  async listDeletedPosts(limit = 50, offset = 0): Promise<{ posts: Post[]; total: number }> {
    const baseQuery = db.select().from(posts)
      .where(sql`${posts.deletedAt} IS NOT NULL`)
      .orderBy(desc(posts.deletedAt));
    
    const countQuery = db.select({ count: count() }).from(posts)
      .where(sql`${posts.deletedAt} IS NOT NULL`);

    const [postsResult, totalResult] = await Promise.all([
      baseQuery.limit(limit).offset(offset),
      countQuery
    ]);

    return {
      posts: postsResult,
      total: totalResult[0].count as number
    };
  }

  async getPostsWithDetails(): Promise<any[]> {
    return db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      status: posts.status,
      viewCount: posts.viewCount,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
      }
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(sql`${posts.deletedAt} IS NULL`)
    .orderBy(desc(posts.createdAt));
  }

  async incrementPostViews(id: string): Promise<void> {
    await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.id, id));
  }

  // Categories
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories)
      .where(and(eq(categories.id, id), sql`${categories.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories)
      .where(and(eq(categories.slug, slug), sql`${categories.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set({ ...category, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    // Soft delete by default for safety
    return this.softDeleteCategory(id);
  }

  async listCategories(includeDeleted = false): Promise<Category[]> {
    const query = db.select().from(categories);
    
    if (!includeDeleted) {
      query.where(sql`${categories.deletedAt} IS NULL`);
    }
    
    return query.orderBy(asc(categories.name));
  }

  async listDeletedCategories(): Promise<Category[]> {
    return db.select().from(categories)
      .where(sql`${categories.deletedAt} IS NOT NULL`)
      .orderBy(desc(categories.deletedAt));
  }

  async softDeleteCategory(id: string): Promise<boolean> {
    const result = await db.update(categories)
      .set({ deletedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result.length > 0;
  }

  async restoreCategory(id: string): Promise<boolean> {
    const result = await db.update(categories)
      .set({ deletedAt: null })
      .where(eq(categories.id, id))
      .returning();
    return result.length > 0;
  }

  // Tags
  async createTag(tag: InsertTag): Promise<Tag> {
    const result = await db.insert(tags).values(tag).returning();
    return result[0];
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const result = await db.select().from(tags)
      .where(and(eq(tags.id, id), sql`${tags.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const result = await db.select().from(tags)
      .where(and(eq(tags.slug, slug), sql`${tags.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const result = await db.update(tags).set(tag).where(eq(tags.id, id)).returning();
    return result[0];
  }

  async deleteTag(id: string): Promise<boolean> {
    // Soft delete by default for safety
    return this.softDeleteTag(id);
  }

  async listTags(includeDeleted = false): Promise<Tag[]> {
    const query = db.select().from(tags);
    
    if (!includeDeleted) {
      query.where(sql`${tags.deletedAt} IS NULL`);
    }
    
    return query.orderBy(asc(tags.name));
  }

  async listDeletedTags(): Promise<Tag[]> {
    return db.select().from(tags)
      .where(sql`${tags.deletedAt} IS NOT NULL`)
      .orderBy(desc(tags.deletedAt));
  }

  async softDeleteTag(id: string): Promise<boolean> {
    const result = await db.update(tags)
      .set({ deletedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();
    return result.length > 0;
  }

  async restoreTag(id: string): Promise<boolean> {
    const result = await db.update(tags)
      .set({ deletedAt: null })
      .where(eq(tags.id, id))
      .returning();
    return result.length > 0;
  }

  async getPostTags(postId: string): Promise<Tag[]> {
    const result = await db.select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      createdAt: tags.createdAt,
      deletedAt: tags.deletedAt
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(and(
      eq(postTags.postId, postId),
      sql`${tags.deletedAt} IS NULL`
    ));
    return result as Tag[];
  }

  // Media
  async createMedia(mediaData: InsertMedia, uploadedBy: string): Promise<Media> {
    const result = await db.insert(media).values({ ...mediaData, uploadedBy }).returning();
    return result[0];
  }

  async getMedia(id: string): Promise<Media | undefined> {
    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return result[0];
  }

  async updateMedia(id: string, mediaData: Partial<InsertMedia>): Promise<Media | undefined> {
    const result = await db.update(media).set(mediaData).where(eq(media.id, id)).returning();
    return result[0];
  }

  async deleteMedia(id: string): Promise<boolean> {
    // Soft delete by default for safety
    return this.softDeleteMedia(id);
  }

  async softDeleteMedia(id: string): Promise<boolean> {
    const result = await db.update(media)
      .set({ deletedAt: new Date() })
      .where(eq(media.id, id))
      .returning();
    return result.length > 0;
  }

  async restoreMedia(id: string): Promise<boolean> {
    const result = await db.update(media)
      .set({ deletedAt: null })
      .where(eq(media.id, id))
      .returning();
    return result.length > 0;
  }

  async listMedia(limit = 50, offset = 0, includeDeleted = false): Promise<{ media: Media[]; total: number }> {
    const baseQuery = db.select().from(media);
    const countQuery = db.select({ count: count() }).from(media);
    
    if (!includeDeleted) {
      baseQuery.where(sql`${media.deletedAt} IS NULL`);
      countQuery.where(sql`${media.deletedAt} IS NULL`);
    }
    
    const [mediaResult, totalResult] = await Promise.all([
      baseQuery.orderBy(desc(media.createdAt)).limit(limit).offset(offset),
      countQuery
    ]);

    return {
      media: mediaResult,
      total: totalResult[0].count as number
    };
  }

  async listDeletedMedia(limit = 50, offset = 0): Promise<{ media: Media[]; total: number }> {
    const [mediaResult, totalResult] = await Promise.all([
      db.select().from(media)
        .where(sql`${media.deletedAt} IS NOT NULL`)
        .orderBy(desc(media.deletedAt))
        .limit(limit).offset(offset),
      db.select({ count: count() }).from(media)
        .where(sql`${media.deletedAt} IS NOT NULL`)
    ]);

    return {
      media: mediaResult,
      total: totalResult[0].count as number
    };
  }

  // Analytics
  async trackEvent(type: string, entityId?: string, entityType?: string, userId?: string, metadata?: any): Promise<void> {
    await db.insert(analytics).values({
      type,
      entityId,
      entityType,
      userId,
      metadata
    });
  }

  async getDashboardStats(): Promise<any> {
    const [
      totalPosts,
      publishedPosts,
      totalCategories,
      totalTags,
      totalMedia,
      totalUsers,
      recentPosts
    ] = await Promise.all([
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(posts).where(eq(posts.status, 'published')),
      db.select({ count: count() }).from(categories),
      db.select({ count: count() }).from(tags),
      db.select({ count: count() }).from(media),
      db.select({ count: count() }).from(users),
      db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5)
    ]);

    return {
      totalPosts: totalPosts[0].count,
      publishedPosts: publishedPosts[0].count,
      totalCategories: totalCategories[0].count,
      totalTags: totalTags[0].count,
      totalMedia: totalMedia[0].count,
      totalUsers: totalUsers[0].count,
      recentPosts
    };
  }

  async getPostAnalytics(postId: string): Promise<any> {
    const post = await this.getPost(postId);
    if (!post) return null;

    const viewEvents = await db.select({ count: count() })
      .from(analytics)
      .where(and(
        eq(analytics.type, 'post_view'),
        eq(analytics.entityId, postId)
      ));

    return {
      post,
      totalViews: viewEvents[0].count,
      dbViewCount: post.viewCount
    };
  }

  async getPopularPosts(limit = 10): Promise<any[]> {
    return db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      viewCount: posts.viewCount,
      publishedAt: posts.publishedAt
    })
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.viewCount))
    .limit(limit);
  }
  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0];
  }

  async setSetting(key: string, value: any, category?: string, isPublic?: boolean, description?: string): Promise<Setting> {
    // Check if setting already exists
    const existing = await this.getSetting(key);
    
    if (existing) {
      // Update existing setting
      const updateData: any = {
        value
      };
      if (category !== undefined) updateData.category = category;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (description !== undefined) updateData.description = description;

      const result = await db.update(settings)
        .set(updateData)
        .where(eq(settings.key, key))
        .returning();
      return result[0];
    } else {
      // Create new setting
      const result = await db.insert(settings).values({
        key,
        value,
        category: category || "general",
        isPublic: isPublic || false,
        description
      }).returning();
      return result[0];
    }
  }

  async getSettings(category?: string, publicOnly?: boolean): Promise<Setting[]> {
    let query = db.select().from(settings);
    
    const conditions = [];
    if (category) conditions.push(eq(settings.category, category));
    if (publicOnly) conditions.push(eq(settings.isPublic, true));
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions)) as any;
    }
    
    return query.orderBy(asc(settings.category), asc(settings.key));
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db.delete(settings).where(eq(settings.key, key));
    return result.length > 0;
  }

  async updateSetting(key: string, updates: Partial<InsertSetting>): Promise<Setting | undefined> {
    const result = await db.update(settings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return result[0];
  }

  async initializeEmailService(): Promise<void> {
    try {
      // Get email settings
      const emailSettings = await this.getSettings('email', false);
      const settingsMap: { [key: string]: any } = {};
      
      emailSettings.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });

      // Check if SMTP is configured
      if (settingsMap.emailProvider === 'smtp' && 
          settingsMap.smtpHost && 
          settingsMap.smtpUsername && 
          settingsMap.smtpPassword) {
        
        const { emailService } = await import('./services/emailService');
        await emailService.initialize({
          provider: 'smtp',
          smtpHost: settingsMap.smtpHost,
          smtpPort: parseInt(settingsMap.smtpPort) || 587,
          smtpUsername: settingsMap.smtpUsername,
          smtpPassword: settingsMap.smtpPassword,
          fromEmail: settingsMap.fromEmail || 'noreply@example.com',
          fromName: settingsMap.fromName || 'CMS',
        });
        
        console.log('✅ Email service initialized from settings');
      } else {
        console.log('📧 Email service not configured - SMTP settings missing');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  // Sections
  async createSection(sectionData: InsertSection, createdBy: string): Promise<Section> {
    const result = await db.insert(sections).values({ ...sectionData, createdBy }).returning();
    return result[0];
  }

  async getSection(id: string): Promise<Section | undefined> {
    const result = await db.select().from(sections)
      .where(and(eq(sections.id, id), sql`${sections.deletedAt} IS NULL`))
      .limit(1);
    return result[0];
  }

  async updateSection(id: string, sectionData: Partial<InsertSection>): Promise<Section | undefined> {
    const result = await db.update(sections)
      .set({ ...sectionData, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return result[0];
  }

  async deleteSection(id: string): Promise<boolean> {
    return this.softDeleteSection(id);
  }

  async softDeleteSection(id: string): Promise<boolean> {
    const result = await db.update(sections)
      .set({ deletedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return result.length > 0;
  }

  async restoreSection(id: string): Promise<boolean> {
    const result = await db.update(sections)
      .set({ deletedAt: null })
      .where(eq(sections.id, id))
      .returning();
    return result.length > 0;
  }

  async listSections(pageId?: string, includeDeleted = false): Promise<Section[]> {
    let query = db.select().from(sections);
    
    const conditions = [];
    if (!includeDeleted) {
      conditions.push(sql`${sections.deletedAt} IS NULL`);
    }
    if (pageId) {
      conditions.push(eq(sections.pageId, pageId));
    }
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions)) as any;
    }
    
    return query.orderBy(asc(sections.order), asc(sections.createdAt));
  }

  async reorderSections(sectionIds: string[]): Promise<boolean> {
    try {
      // Update the order of sections based on the provided array
      for (let i = 0; i < sectionIds.length; i++) {
        await db.update(sections)
          .set({ order: i, updatedAt: new Date() })
          .where(eq(sections.id, sectionIds[i]));
      }
      return true;
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      return false;
    }
  }

  // Search functionality
  async searchContent(query: string, type = "all", limit = 10): Promise<{ results: any[]; total: number }> {
    try {
      const searchTerms = `%${query.toLowerCase()}%`;
      const results: any[] = [];

      if (type === "all" || type === "posts") {
        // Search posts by title, excerpt, and content
        const postResults = await db.select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          slug: posts.slug,
          status: posts.status,
          createdAt: posts.createdAt,
          type: sql<string>`'post'`.as('type'),
          authorName: users.displayName,
          categoryName: categories.name
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(
          and(
            sql`${posts.deletedAt} IS NULL`,
            or(
              sql`LOWER(${posts.title}) LIKE ${searchTerms}`,
              sql`LOWER(${posts.excerpt}) LIKE ${searchTerms}`,
              sql`LOWER(${posts.content}) LIKE ${searchTerms}`
            )
          )
        )
        .limit(type === "posts" ? limit : Math.max(1, Math.floor(limit / 3)))
        .orderBy(desc(posts.createdAt));

        results.push(...postResults);
      }

      if (type === "all" || type === "categories") {
        // Search categories
        const categoryResults = await db.select({
          id: categories.id,
          title: categories.name,
          excerpt: categories.description,
          slug: categories.slug,
          createdAt: categories.createdAt,
          type: sql<string>`'category'`.as('type'),
          postCount: sql<number>`0`.as('postCount')
        })
        .from(categories)
        .where(
          and(
            sql`${categories.deletedAt} IS NULL`,
            or(
              sql`LOWER(${categories.name}) LIKE ${searchTerms}`,
              sql`LOWER(${categories.description}) LIKE ${searchTerms}`
            )
          )
        )
        .limit(type === "categories" ? limit : Math.max(1, Math.floor(limit / 3)))
        .orderBy(desc(categories.createdAt));

        results.push(...categoryResults);
      }

      if (type === "all" || type === "media") {
        // Search media files
        const mediaResults = await db.select({
          id: media.id,
          title: media.filename,
          excerpt: media.alt,
          createdAt: media.createdAt,
          type: sql<string>`'media'`.as('type'),
          fileUrl: media.url,
          fileType: media.mimeType,
          fileSize: media.size
        })
        .from(media)
        .where(
          and(
            sql`${media.deletedAt} IS NULL`,
            or(
              sql`LOWER(${media.filename}) LIKE ${searchTerms}`,
              sql`LOWER(${media.alt}) LIKE ${searchTerms}`
            )
          )
        )
        .limit(type === "media" ? limit : Math.max(1, Math.floor(limit / 3)))
        .orderBy(desc(media.createdAt));

        results.push(...mediaResults);
      }

      // Sort all results by relevance (exact matches first, then partial matches)
      // and by recency within each relevance group
      const sortedResults = results
        .sort((a, b) => {
          const aTitle = a.title?.toLowerCase() || '';
          const bTitle = b.title?.toLowerCase() || '';
          const queryLower = query.toLowerCase();
          
          // Exact title matches first
          const aExact = aTitle === queryLower ? 1 : 0;
          const bExact = bTitle === queryLower ? 1 : 0;
          
          if (aExact !== bExact) return bExact - aExact;
          
          // Title starts with query
          const aStarts = aTitle.startsWith(queryLower) ? 1 : 0;
          const bStarts = bTitle.startsWith(queryLower) ? 1 : 0;
          
          if (aStarts !== bStarts) return bStarts - aStarts;
          
          // Then by recency
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit);

      return {
        results: sortedResults,
        total: sortedResults.length
      };
    } catch (error) {
      console.error('Search content error:', error);
      return { results: [], total: 0 };
    }
  }
}

export const storage = new PostgreSQLStorage();
