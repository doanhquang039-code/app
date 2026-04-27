require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();

// Existing routes
const commentRoutes = require("./src/routes/commentRoutes");
const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const seoRoutes = require("./src/routes/seoRoutes");
const scheduleRoutes = require("./src/routes/scheduleRoutes");
const relatedPostsRoutes = require("./src/routes/relatedPostsRoutes");
const commentRatingRoutes = require("./src/routes/commentRatingRoutes");        
const activityRoutes = require("./src/routes/activityRoutes");
const newsletterRoutes = require("./src/routes/newsletterRoutes");

// Advanced features routes
const aiRoutes = require("./src/routes/aiRoutes");
const socialRoutes = require("./src/routes/socialRoutes");
const advancedAnalyticsRoutes = require("./src/routes/advancedAnalyticsRoutes");
const cmsRoutes = require("./src/routes/cmsRoutes");

// Enhanced Post & Comment routes
const enhancedPostRoutes = require("./src/routes/enhancedPostRoutes");
const enhancedCommentRoutes = require("./src/routes/enhancedCommentRoutes");

require("./src/config/db");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🚀 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Existing routes
app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/search", searchRoutes);
app.use("/api/search", searchRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/seo", seoRoutes);
app.use("/api/seo", seoRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/related-posts", relatedPostsRoutes);
app.use("/api/comment-ratings", commentRatingRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/newsletter", newsletterRoutes);

// Advanced features routes
app.use("/api/ai", aiRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/advanced-analytics", advancedAnalyticsRoutes);
app.use("/api/cms", cmsRoutes);

// Enhanced Post & Comment routes
app.use("/api/posts", enhancedPostRoutes);
app.use("/api/comments", enhancedCommentRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      "/api/posts/*",
      "/api/comments/*",
      "/api/ai/*",
      "/api/social/*",
      "/api/advanced-analytics/*",
      "/api/cms/*"
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n🚀 AVAILABLE FEATURES:`);
  console.log(`   📝 Enhanced Posts: /api/posts/*`);
  console.log(`   💬 Enhanced Comments: /api/comments/*`);
  console.log(`   🤖 AI Content Generation: /api/ai/*`);
  console.log(`   📱 Social Media Integration: /api/social/*`);
  console.log(`   📊 Advanced Analytics: /api/advanced-analytics/*`);
  console.log(`   🎨 CMS Advanced Features: /api/cms/*`);
  console.log(`\n${'='.repeat(60)}\n`);
});