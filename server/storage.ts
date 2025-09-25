import { 
  type User, type InsertUser,
  type Post, type InsertPost,
  type Category, type InsertCategory,
  type Tag, type InsertTag,
  type Media, type InsertMedia,
  type Analytics,
  users, posts, categories, tags, media, analytics, postTags
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
  listPosts(filters?: { status?: string; categoryId?: string; authorId?: string; limit?: number; offset?: number }): Promise<{ posts: Post[]; total: number }>;
  getPostsWithDetails(): Promise<any[]>;
  incrementPostViews(id: string): Promise<void>;

  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  listCategories(): Promise<Category[]>;

  // Tags
  createTag(tag: InsertTag): Promise<Tag>;
  getTag(id: string): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: string): Promise<boolean>;
  listTags(): Promise<Tag[]>;
  getPostTags(postId: string): Promise<Tag[]>;

  // Media
  createMedia(media: InsertMedia, uploadedBy: string): Promise<Media>;
  getMedia(id: string): Promise<Media | undefined>;
  updateMedia(id: string, media: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  listMedia(limit?: number, offset?: number): Promise<{ media: Media[]; total: number }>;

  // Analytics
  trackEvent(type: string, entityId?: string, entityType?: string, userId?: string, metadata?: any): Promise<void>;
  getDashboardStats(): Promise<any>;
  getPostAnalytics(postId: string): Promise<any>;
  getPopularPosts(limit?: number): Promise<any[]>;
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
    return (result.rowCount ?? 0) > 0;
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
    return await db.transaction(async (tx) => {
      const result = await tx.insert(posts).values({ ...post, authorId }).returning();
      const createdPost = result[0];

      // Associate tags if provided
      if (tagIds && tagIds.length > 0) {
        const tagAssociations = tagIds.map(tagId => ({
          postId: createdPost.id,
          tagId
        }));
        await tx.insert(postTags).values(tagAssociations);
      }

      return createdPost;
    });
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
    return result[0];
  }

  async updatePost(id: string, post: Partial<InsertPost>, tagIds?: string[]): Promise<Post | undefined> {
    return await db.transaction(async (tx) => {
      const result = await tx.update(posts).set({ ...post, updatedAt: new Date() }).where(eq(posts.id, id)).returning();
      
      if (result.length > 0 && tagIds !== undefined) {
        // Remove existing tag associations
        await tx.delete(postTags).where(eq(postTags.postId, id));
        
        // Add new tag associations
        if (tagIds.length > 0) {
          const tagAssociations = tagIds.map(tagId => ({
            postId: id,
            tagId
          }));
          await tx.insert(postTags).values(tagAssociations);
        }
      }

      return result[0];
    });
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async listPosts(filters?: { status?: string; categoryId?: string; authorId?: string; limit?: number; offset?: number }): Promise<{ posts: Post[]; total: number }> {
    const conditions = [];
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
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set({ ...category, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async listCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  // Tags
  async createTag(tag: InsertTag): Promise<Tag> {
    const result = await db.insert(tags).values(tag).returning();
    return result[0];
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return result[0];
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const result = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    return result[0];
  }

  async updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const result = await db.update(tags).set(tag).where(eq(tags.id, id)).returning();
    return result[0];
  }

  async deleteTag(id: string): Promise<boolean> {
    const result = await db.delete(tags).where(eq(tags.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async listTags(): Promise<Tag[]> {
    return db.select().from(tags).orderBy(asc(tags.name));
  }

  async getPostTags(postId: string): Promise<Tag[]> {
    return db.select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      createdAt: tags.createdAt
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));
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
    const result = await db.delete(media).where(eq(media.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async listMedia(limit = 50, offset = 0): Promise<{ media: Media[]; total: number }> {
    const [mediaResult, totalResult] = await Promise.all([
      db.select().from(media).orderBy(desc(media.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(media)
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
}

export const storage = new PostgreSQLStorage();
