import { db } from "../server/db";
import { storage } from "../server/storage";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create admin user first
    console.log("📝 Creating admin user...");
    const adminUser = await storage.createUser({
      username: "admin",
      password: "admin123", // This will be hashed automatically
      email: "admin@penkora.local", 
      role: "admin",
      displayName: "Administrator"
    });
    console.log("✅ Admin user created:", adminUser.username);

    // Create editor user
    console.log("📝 Creating editor user...");
    const editorUser = await storage.createUser({
      username: "editor",
      password: "editor123",
      email: "editor@penkora.local",
      role: "editor", 
      displayName: "Content Editor"
    });
    console.log("✅ Editor user created:", editorUser.username);

    // Create categories
    console.log("📂 Creating categories...");
    const categories = await Promise.all([
      storage.createCategory({
        name: "Technology",
        slug: "technology",
        description: "Latest tech trends and innovations",
        color: "#3b82f6"
      }),
      storage.createCategory({
        name: "Development", 
        slug: "development",
        description: "Programming and software development",
        color: "#10b981"
      }),
      storage.createCategory({
        name: "Design",
        slug: "design", 
        description: "UI/UX design and creative content",
        color: "#8b5cf6"
      }),
      storage.createCategory({
        name: "Business",
        slug: "business",
        description: "Business insights and strategies",
        color: "#f59e0b"
      })
    ]);
    console.log("✅ Categories created:", categories.length);

    // Create tags
    console.log("🏷️ Creating tags...");
    const tags = await Promise.all([
      storage.createTag({ name: "React", slug: "react", color: "#61dafb" }),
      storage.createTag({ name: "TypeScript", slug: "typescript", color: "#3178c6" }),
      storage.createTag({ name: "JavaScript", slug: "javascript", color: "#f7df1e" }),
      storage.createTag({ name: "CSS", slug: "css", color: "#1572b6" }),
      storage.createTag({ name: "HTML", slug: "html", color: "#e34f26" }),
      storage.createTag({ name: "Node.js", slug: "nodejs", color: "#339933" }),
      storage.createTag({ name: "Database", slug: "database", color: "#336791" }),
      storage.createTag({ name: "Tutorial", slug: "tutorial", color: "#ff6b6b" }),
      storage.createTag({ name: "Best Practices", slug: "best-practices", color: "#4ecdc4" }),
      storage.createTag({ name: "Performance", slug: "performance", color: "#45b7d1" })
    ]);
    console.log("✅ Tags created:", tags.length);

    // Create sample posts
    console.log("📝 Creating sample posts...");
    const posts = [
      {
        title: "Getting Started with React and TypeScript",
        slug: "getting-started-react-typescript",
        content: `
# Getting Started with React and TypeScript

React and TypeScript together provide a powerful combination for building modern web applications. This guide will walk you through setting up a new project and understanding the core concepts.

## Why TypeScript with React?

TypeScript brings static typing to JavaScript, which helps catch errors early and provides better IDE support. When combined with React, it makes component development more robust and maintainable.

### Key Benefits:
- **Type Safety**: Catch errors at compile time
- **Better IntelliSense**: Enhanced autocomplete and refactoring
- **Self-Documenting Code**: Types serve as inline documentation
- **Easier Refactoring**: Confidence when changing code structure

## Setting Up Your Project

\`\`\`bash
npx create-react-app my-app --template typescript
cd my-app
npm start
\`\`\`

## Your First TypeScript Component

\`\`\`tsx
interface Props {
  name: string;
  age?: number;
}

const Welcome: React.FC<Props> = ({ name, age }) => {
  return (
    <div>
      <h1>Welcome, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
};
\`\`\`

This is just the beginning of your TypeScript React journey!
        `,
        excerpt: "Learn how to set up a modern React project with TypeScript for better development experience and type safety.",
        status: "published",
        categoryId: categories[1].id, // Development
        publishedAt: new Date("2024-03-15"),
        meta: {
          seoTitle: "React TypeScript Tutorial - Complete Beginner's Guide",
          seoDescription: "Complete guide to setting up React with TypeScript. Learn best practices, type safety, and modern development techniques.",
          keywords: ["react", "typescript", "tutorial", "web development"]
        }
      },
      {
        title: "Advanced TypeScript Patterns for React Development", 
        slug: "advanced-typescript-patterns-react",
        content: `
# Advanced TypeScript Patterns for React Development

Once you're comfortable with basic TypeScript in React, it's time to explore advanced patterns that can make your code more robust and maintainable.

## Generic Components

\`\`\`tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Conditional Props

\`\`\`tsx
type ButtonProps = 
  | { variant: 'primary'; onClick: () => void }
  | { variant: 'link'; href: string };

const Button: React.FC<ButtonProps> = (props) => {
  if (props.variant === 'primary') {
    return <button onClick={props.onClick}>Click me</button>;
  }
  return <a href={props.href}>Navigate</a>;
};
\`\`\`

These patterns help create more flexible and type-safe components.
        `,
        excerpt: "Exploring advanced TypeScript features and design patterns for building better React applications.",
        status: "published", 
        categoryId: categories[1].id, // Development
        publishedAt: new Date("2024-03-12"),
        meta: {
          seoTitle: "Advanced TypeScript Patterns for React - Expert Guide",
          seoDescription: "Master advanced TypeScript patterns including generics, conditional types, and utility types for React development.",
          keywords: ["typescript", "react", "advanced", "patterns", "generics"]
        }
      },
      {
        title: "Database Design Best Practices for Modern Applications",
        slug: "database-design-best-practices",
        content: `
# Database Design Best Practices for Modern Applications

Good database design is the foundation of any successful application. Here are the essential principles and practices to follow.

## Core Principles

### 1. Normalization
- Eliminate data redundancy
- Ensure data integrity
- Reduce storage space

### 2. Proper Indexing
\`\`\`sql
-- Index frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_post_status ON posts(status, created_at);
\`\`\`

### 3. Choose the Right Data Types
- Use appropriate size for your data
- Consider performance implications
- Plan for future growth

## Schema Design Tips

1. **Use meaningful names**: Table and column names should be descriptive
2. **Consistent naming conventions**: Stick to snake_case or camelCase throughout
3. **Foreign key relationships**: Properly define relationships between tables
4. **Constraints**: Use NOT NULL, UNIQUE, and CHECK constraints appropriately

## Performance Considerations

- Index frequently queried columns
- Avoid over-indexing (impacts write performance)
- Use EXPLAIN ANALYZE to optimize queries
- Consider partitioning for large tables

Remember: Good design upfront saves hours of refactoring later!
        `,
        excerpt: "Learn how to design scalable and efficient database schemas with modern best practices and optimization techniques.",
        status: "published",
        categoryId: categories[0].id, // Technology
        publishedAt: new Date("2024-03-10"),
        meta: {
          seoTitle: "Database Design Best Practices - Complete Guide",
          seoDescription: "Master database design with normalization, indexing, and performance optimization techniques for modern applications.",
          keywords: ["database", "design", "sql", "optimization", "best practices"]
        }
      },
      {
        title: "Modern CSS Techniques: Grid, Flexbox, and Beyond",
        slug: "modern-css-techniques", 
        content: `
# Modern CSS Techniques: Grid, Flexbox, and Beyond

CSS has evolved tremendously. Let's explore modern layout techniques that make responsive design easier and more powerful.

## CSS Grid Layout

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  min-height: 100vh;
}

.header { grid-column: 1 / -1; }
.main { grid-column: 2; }
.footer { grid-column: 1 / -1; }
\`\`\`

## Flexbox for Components

\`\`\`css
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-actions {
  margin-top: auto;
  padding-top: 1rem;
}
\`\`\`

## CSS Custom Properties

\`\`\`css
:root {
  --primary-color: #3b82f6;
  --text-color: #1f2937;
  --spacing-unit: 0.5rem;
}

.button {
  background: var(--primary-color);
  color: white;
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4);
}
\`\`\`

These techniques enable more maintainable and flexible designs!
        `,
        excerpt: "CSS Grid, Flexbox, and modern layout techniques explained with practical examples for responsive web design.",
        status: "published",
        categoryId: categories[2].id, // Design 
        publishedAt: new Date("2024-03-08"),
        meta: {
          seoTitle: "Modern CSS Techniques - Grid, Flexbox & More",
          seoDescription: "Learn modern CSS layout techniques including Grid, Flexbox, and custom properties for responsive web design.",
          keywords: ["css", "grid", "flexbox", "responsive", "modern"]
        }
      },
      {
        title: "Building Scalable APIs with Node.js and Express",
        slug: "building-scalable-apis-nodejs-express",
        content: `
# Building Scalable APIs with Node.js and Express

Creating APIs that can handle growth requires careful planning and implementation. Here's how to build APIs that scale.

## Project Structure

\`\`\`
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── utils/
└── app.js
\`\`\`

## Error Handling Middleware

\`\`\`javascript
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
\`\`\`

## Input Validation

\`\`\`javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
\`\`\`

## Rate Limiting

\`\`\`javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
\`\`\`

Building for scale from the beginning saves refactoring pain later!
        `,
        excerpt: "Build robust and scalable REST APIs using Node.js and Express with proper error handling, validation, and security.",
        status: "draft",
        categoryId: categories[1].id, // Development
        meta: {
          seoTitle: "Scalable Node.js API Development Guide",
          seoDescription: "Learn to build scalable APIs with Node.js and Express including error handling, validation, and performance optimization.",
          keywords: ["nodejs", "express", "api", "scalable", "backend"]
        }
      },
      {
        title: "The Future of Web Development: Trends to Watch in 2024",
        slug: "future-web-development-2024-trends",
        content: `
# The Future of Web Development: Trends to Watch in 2024

Web development continues to evolve rapidly. Here are the key trends shaping the future of our industry.

## Key Trends

### 1. WebAssembly (WASM) Adoption
- Near-native performance in browsers
- Support for multiple programming languages
- Game-changing for computationally intensive applications

### 2. Edge Computing
- Reduced latency with edge servers
- Better user experience globally
- CDN evolution beyond static assets

### 3. JAMstack Evolution
- Static site generators becoming more powerful
- Hybrid rendering approaches
- Better developer experience tools

### 4. AI-Powered Development
- Code completion and generation
- Automated testing and optimization
- Design-to-code tools improving rapidly

## Framework Landscape

### React Ecosystem
- Concurrent features stabilizing
- Server Components gaining traction
- Improved developer tools

### Vue.js 3
- Composition API adoption
- Better TypeScript support
- Performance improvements

### Svelte/SvelteKit
- Compile-time optimization
- Simplified state management
- Growing ecosystem

## Performance Focus

- Core Web Vitals importance growing
- Progressive enhancement strategies
- Bundle size optimization techniques

The future is exciting - stay curious and keep learning!
        `,
        excerpt: "Exploring upcoming trends and technologies that will shape the future of web development in 2024 and beyond.",
        status: "scheduled",
        categoryId: categories[0].id, // Technology
        publishedAt: new Date("2024-03-25"),
        meta: {
          seoTitle: "Web Development Trends 2024 - Future Technologies",
          seoDescription: "Discover the latest web development trends for 2024 including WebAssembly, edge computing, and AI-powered development tools.",
          keywords: ["web development", "2024", "trends", "webassembly", "edge computing"]
        }
      }
    ];

    const createdPosts = [];
    for (const postData of posts) {
      // Assign posts to different authors
      const authorId = Math.random() > 0.5 ? adminUser.id : editorUser.id;
      
      // Select random tags (2-4 tags per post)
      const selectedTags = tags
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 3))
        .map(tag => tag.id);

      const post = await storage.createPost(postData, authorId, selectedTags);
      createdPosts.push(post);
      
      // Add some view counts to published posts
      if (postData.status === "published") {
        const viewCount = Math.floor(Math.random() * 2000) + 100;
        for (let i = 0; i < viewCount; i++) {
          await storage.trackEvent("post_view", post.id, "post");
        }
        // Update the view count in the post
        await storage.incrementPostViews(post.id);
      }
    }
    console.log("✅ Posts created:", createdPosts.length);

    // Create some sample media entries
    console.log("🖼️ Creating sample media...");
    const mediaItems = [
      {
        filename: "hero-image.jpg",
        originalName: "hero-image.jpg", 
        mimeType: "image/jpeg",
        size: 245760,
        url: "/images/hero-image.jpg",
        alt: "Hero section background image",
        caption: "Modern workspace with laptop and coffee"
      },
      {
        filename: "post-thumbnail.png",
        originalName: "post-thumbnail.png",
        mimeType: "image/png", 
        size: 128000,
        url: "/images/post-thumbnail.png",
        alt: "Blog post thumbnail",
        caption: "Featured image for latest blog post"
      },
      {
        filename: "user-avatar.jpg",
        originalName: "user-avatar.jpg",
        mimeType: "image/jpeg",
        size: 45000,
        url: "/images/user-avatar.jpg", 
        alt: "User profile avatar",
        caption: "Profile picture"
      }
    ];

    for (const mediaData of mediaItems) {
      await storage.createMedia(mediaData, adminUser.id);
    }
    console.log("✅ Media items created:", mediaItems.length);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: 2 (1 admin, 1 editor)`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Tags: ${tags.length}`);
    console.log(`- Posts: ${createdPosts.length}`);
    console.log(`- Media: ${mediaItems.length}`);
    console.log("\n🔑 Login credentials:");
    console.log("Admin: username='admin', password='admin123'");
    console.log("Editor: username='editor', password='editor123'");

  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}

// Run the seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };