const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const rateLimit = require("express-rate-limit");
const https = require("https");
require("dotenv").config();

const app = express();

// ============================================
// CORS — allowlist known origins only
// ============================================
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, same-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

// ============================================
// FILE UPLOAD — multer for image uploads
// ============================================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

const imageFileFilter = (_req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  if (allowed.test(path.extname(file.originalname)) && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, gif, webp, svg)."), false);
  }
};

const upload = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

// Serve uploaded files as static assets
app.use("/api/uploads", express.static(uploadsDir));

const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY — JWT_SECRET must be set in env
// ============================================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set. Refusing to start.");
  process.exit(1);
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ============================================
// RATE LIMITERS
// ============================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait 15 minutes and try again." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests. Please wait an hour and try again." },
});

// ============================================
// AUTH MIDDLEWARE — verify JWT Bearer token
// ============================================
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please sign in again." });
  }
}

let prisma = null;

const DEFAULT_SETTINGS = {
  storeName: "House of Phones",
  storeTagline: "Premium Smartphones & Accessories",
  storeAddress: "Shop No. 8 & 9, Saraswati Mini Market, Bibwewadi, Pune – 411037",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411037",
  country: "India",
  storeEmail: "houseofphones92@gmail.com",
  supportEmail: "houseofphones92@gmail.com",
  alternateEmail: "",
  storePhone: "+91 9637671118",
  whatsappNumber: "+91 9637671118",
  currency: "INR (₹)",
  timezone: "Asia/Kolkata (UTC +5:30)",
  freeShippingThreshold: "999",
  standardShippingFee: "49",
  expressShippingFee: "99",
  returnPolicyDays: "7",
  lowStockThreshold: "5",
  gstRate: "18",
  instagramUrl: "https://www.instagram.com/houseofphonesofficial",
  facebookUrl: "https://www.facebook.com/HouseOfPhones",
  youtubeUrl: "https://www.youtube.com/@houseofphoneofficial",
  twitterUrl: "",
  storeSince: "2024",
  businessType: "Retail Store",
  storeStatus: "Active",
  businessHoursWeekday: "10:00 AM – 9:00 PM",
  businessHoursSunday: "11:00 AM – 7:00 PM",
  sessionTimeout: "60",
  require2FA: "Disabled",
  orderEmailNotifications: "true",
  enquiryEmailNotifications: "true",
  newsletterSubscriptions: "false",
  processingTime: "1 - 2 Business Days",
  shippingPolicy: "Standard Shipping",
  deliverTo: "All Across India",
  estimatedDelivery: "3 - 7 Business Days",
  cashOnDelivery: "true",
  orderTracking: "true",
  storePickup: "false",
  pickupTiming: "10:00 AM – 9:00 PM",
  loginNotifications: "true",
  activeSessions: "1",
  lastPasswordChange: "",
  cancellationPolicy: "7 Days Easy Cancellation",
};

async function getBackendSettings() {
  if (!prisma) return { ...DEFAULT_SETTINGS };
  try {
    const rows = await prisma.setting.findMany();
    const map = { ...DEFAULT_SETTINGS };
    rows.forEach((r) => {
      if (r.value !== undefined && r.value !== null) {
        map[r.key] = r.value;
      }
    });
    return map;
  } catch (err) {
    console.warn("Error loading settings from DB, using defaults:", err.message);
    return { ...DEFAULT_SETTINGS };
  }
}

async function seedDefaultSettingsIfEmpty() {
  if (!prisma) return;
  try {
    const count = await prisma.setting.count();
    if (count === 0) {
      console.log("🌱 Seeding default settings into PostgreSQL database...");
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        await prisma.setting.upsert({
          where: { key },
          update: {},
          create: { key, value: String(value) },
        });
      }
      console.log("✅ Default settings seeded successfully.");
    }
  } catch (err) {
    console.warn("Could not check/seed default settings:", err.message);
  }
}

try {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  console.log("✅ Connected to PostgreSQL database via Prisma & pg Pool.");
  seedDefaultSettingsIfEmpty();
} catch (err) {
  console.warn("Could not initialize Prisma client:", err.message);
}

// ============================================
// NOTIFICATION HELPER
// ============================================
async function createNotification(title, message, type = "info", module = null, recordId = null) {
  if (!prisma) return;
  try {
    await prisma.notification.create({ data: { title, message, type, module, recordId } });
  } catch (e) {
    console.warn("Could not create notification:", e.message);
  }
}

// ============================================
// NODEMAILER
// ============================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================
// TEST ROUTE
// ============================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "House of Phones backend is running!",
  });
});

app.get("/api/orders-test", (req, res) => {
  res.json({
    success: true,
    message: "Orders API route is reachable",
  });
});

// ============================================
// IMAGE UPLOAD API
// ============================================
app.post("/api/upload", async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }
    const imageUrl = `/api/uploads/${req.file.filename}`;
    return res.status(200).json({ success: true, url: imageUrl, filename: req.file.filename });
  } catch (e) {
    console.error("UPLOAD ERROR:", e);
    const msg = e.code === "LIMIT_FILE_SIZE"
      ? "File too large. Maximum size is 25MB."
      : e.message || "Upload failed.";
    return res.status(400).json({ success: false, message: msg });
  }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register — rate limited
app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ success: false, message: "Database connection not available" });
    }
    const { name, email, phone, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your full name." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your email address." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        status: "Active",
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        provider: "password",
        memberSince: new Date(user.createdAt).getFullYear().toString(),
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
});

// Login — rate limited
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ success: false, message: "Database connection not available" });
    }
    const { identifier, email, password } = req.body;
    const cleanEmail = (email || identifier || "").toLowerCase().trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Please enter your email address." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Please enter your password." });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    if (user.status === "Inactive" || user.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is disabled. Please contact support.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account was registered with Google. Please use 'Continue with Google'.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // If login notifications are enabled in store settings, record in Activity Log
    try {
      const currentSettings = await getBackendSettings();
      if (currentSettings.loginNotifications === "true") {
        await prisma.activityLog.create({
          data: {
            staffName: user.name || user.email,
            action: "User Login",
            module: "Security",
            description: `User ${user.email} logged in successfully`,
          },
        });
      }
    } catch (logErr) {
      console.warn("Could not record login activity:", logErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        provider: user.googleId && !user.password ? "google" : "password",
        memberSince: new Date(user.createdAt).getFullYear().toString(),
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: error.message,
    });
  }
});

// Google Sign-In — rate limited
app.post("/api/auth/google", authLimiter, async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ success: false, message: "Database connection not available" });
    }
    const { credential, email: directEmail, name: directName, googleId: directGoogleId } = req.body;

    let email = directEmail;
    let name = directName;
    let googleId = directGoogleId;

    if (credential) {
      // SECURITY: Verify the Google ID token server-side using the Google Auth Library.
      // jwt.decode() alone does NOT verify the signature — anyone could forge a token.
      try {
        if (GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (payload) {
            email = payload.email;
            name = payload.name || payload.given_name || "Google User";
            googleId = payload.sub;
          }
        } else {
          // No Google Client ID configured — decode only (dev fallback, not for production)
          console.warn("[SECURITY WARNING] GOOGLE_CLIENT_ID not set. Skipping Google token verification. Set GOOGLE_CLIENT_ID in production.");
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            email = decoded.email;
            name = decoded.name || decoded.given_name || "Google User";
            googleId = decoded.sub;
          }
        }
      } catch (e) {
        console.warn("Google token verification failed:", e.message);
        return res.status(401).json({ success: false, message: "Google authentication failed. Invalid token." });
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Google authentication failed. No email provided." });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || "Google User",
          googleId: googleId || null,
          status: "Active",
        },
      });
    } else if (googleId && !user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google sign-in successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        provider: "google",
        memberSince: new Date(user.createdAt).getFullYear().toString(),
      },
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Google sign-in failed. Please try again.",
      error: error.message,
    });
  }
});

// Forgot Password (Send OTP) — heavily rate limited
app.post("/api/auth/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ success: false, message: "Database connection not available" });
    }
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your email address." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Generate 6-digit OTP using cryptographically secure random number
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiry,
      },
    });

    // Send email
    try {
      await transporter.sendMail({
        from: `"House of Phones" <${process.env.EMAIL_USER || "noreply@houseofphones.com"}>`,
        to: user.email,
        subject: "Password Reset Code — House of Phones",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #D4A574; font-family: serif; margin-top: 0;">House of Phones</h2>
            <p>Hello ${user.name || "Customer"},</p>
            <p>We received a request to reset your password. Use the 6-digit verification code below:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #f3f4f6; padding: 14px; text-align: center; border-radius: 8px; margin: 20px 0; color: #111827;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 13px;">This code will expire in 15 minutes. If you did not request this password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
      console.log(`✅ Password reset OTP sent to ${user.email}`);
    } catch (mailErr) {
      console.error("Nodemailer error sending reset OTP:", mailErr.message);
      console.log(`[DEVELOPMENT BACKUP OTP] The reset code for ${user.email} is: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password request.",
      error: error.message,
    });
  }
});

// Reset Password (Verify OTP & Update Password) — rate limited
app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ success: false, message: "Database connection not available" });
    }
    const { email, otp, newPassword, password } = req.body;
    const chosenPassword = newPassword || password;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your email address." });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ success: false, message: "Please enter the 6-digit verification code." });
    }
    if (!chosenPassword || chosenPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    if (!user.resetToken || user.resetToken.trim() !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." });
    }

    if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new code." });
    }

    const hashedPassword = await bcrypt.hash(chosenPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
      error: error.message,
    });
  }
});

// Current User Me
app.get("/api/auth/me", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ success: false, message: "Database connection not available" });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        googleId: true,
        password: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status === "Inactive" || user.status === "Blocked") {
      return res.status(401).json({ success: false, message: "User not found or inactive" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        provider: user.googleId && !user.password ? "google" : "password",
        memberSince: new Date(user.createdAt).getFullYear().toString(),
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
});
// ============================================
// GET ALL ORDERS - ADMIN
// ============================================

app.get("/api/orders", async (req, res) => {
  console.log("🔥 GET /api/orders HIT");
  try {
    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: "Database connection is not available",
      });
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        items: true,
        address: true,
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ============================================
// GET ORDERS FOR SPECIFIC USER (CUSTOMER PROFILE)
// Auth required: user can only fetch their own orders
// ============================================
app.get("/api/orders/user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    // Authorisation check: the authenticated user must match the requested userId
    if (req.user.userId !== userId && req.user.email !== userId) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own orders." });
    }
    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: "Database connection is not available",
      });
    }

    // Look up user by ID or email to get all related order IDs
    const userRecord = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
    });

    const whereClause = userRecord
      ? {
          OR: [
            { userId: userRecord.id },
            { userId: userId },
            { address: { email: userRecord.email } },
          ],
        }
      : { userId };

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        items: true,
        address: true,
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
});

// ============================================
// GET SINGLE ORDER BY ORDER ID (TRACK ORDER / DETAILS)
// ============================================
app.get("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: "Database connection is not available",
      });
    }

    // Lookup either by orderId (e.g. HOP-2087344) or internal id
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderId: orderId },
          { id: orderId },
        ],
      },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET SINGLE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

// ============================================
// UPDATE ORDER STATUS (ADMIN LIFECYCLE)
// ============================================
app.patch("/api/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: "Database connection is not available",
      });
    }

    // Find the existing order first
    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ orderId: orderId }, { id: orderId }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found`,
      });
    }

    const updateData = { status };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    } else if (status === "Delivered" && existing.paymentMode === "cod") {
      // Automatically update payment to Completed on COD delivery if not specified
      updateData.paymentStatus = "Completed";
    }
    if (req.body.cancellationReason || req.body.reason) {
      updateData.cancellationReason = req.body.cancellationReason || req.body.reason;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        items: true,
        address: true,
      },
    });

    console.log(`✅ Order #${existing.orderId} status updated: ${existing.status} -> ${status}`);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

// ============================================
// CANCEL ORDER (CUSTOMER / ADMIN)
// ============================================
app.post("/api/orders/:orderId/cancel", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: "Database connection is not available",
      });
    }

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ orderId: orderId }, { id: orderId }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found`,
      });
    }

    const currentStatus = existing.status.toLowerCase();

    if (currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This order is already cancelled.",
      });
    }

    if (currentStatus === "delivered" || currentStatus === "out for delivery") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${existing.status} state. Please request a return if needed.`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: "Cancelled",
        cancellationReason: reason !== undefined ? (reason || null) : (existing.cancellationReason || null),
      },
      include: {
        items: true,
        address: true,
      },
    });

    console.log(`✅ Order #${existing.orderId} cancelled (Reason: ${reason || "Not specified"})`);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      status: "Cancelled",
      cancellationReason: reason || null,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
});

// ============================================
// DASHBOARD STATS API
// ============================================
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: "Database connection is not available",
      });
    }

    const orders = await prisma.order.findMany({
      orderBy: { date: "desc" },
      include: {
        items: true,
        address: true,
      },
    });

    const totalOrders = orders.length;
    const totalSales = orders
      .filter((o) => o.status.toLowerCase() !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const userCount = await prisma.user.count();

    const counts = {
      pending: orders.filter((o) => o.status.toLowerCase() === "pending").length,
      processing: orders.filter((o) => o.status.toLowerCase() === "processing").length,
      confirmed: orders.filter((o) => o.status.toLowerCase() === "confirmed").length,
      packed: orders.filter((o) => o.status.toLowerCase() === "packed").length,
      shipped: orders.filter((o) => o.status.toLowerCase() === "shipped").length,
      outForDelivery: orders.filter((o) => o.status.toLowerCase() === "out for delivery").length,
      delivered: orders.filter((o) => o.status.toLowerCase() === "delivered").length,
      cancelled: orders.filter((o) => o.status.toLowerCase() === "cancelled").length,
      cancellationRequested: orders.filter((o) => o.status.toLowerCase() === "cancellation requested").length,
    };

    const statusBreakdown = {};
    orders.forEach((o) => {
      const s = o.status || "Processing";
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    });

    const recentOrders = orders.slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        customers: userCount || new Set(orders.map((o) => o.userId)).size,
        products: 48,
        counts,
        statusBreakdown,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
});

// ============================================
// CONTACT EMAIL
// ============================================

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    // Save enquiry to database so it appears in Admin Panel → Enquiries
    if (prisma) {
      try {
        await prisma.enquiry.create({
          data: {
            name,
            email,
            phone: phone || null,
            subject: subject || "Contact Form Inquiry",
            message,
            status: "New",
          },
        });
        console.log(`Contact enquiry saved to database from ${email}`);
        createNotification("New Enquiry", `${name} submitted a contact form: "${subject || 'Contact Form Inquiry'}"`, "info", "Enquiries");
      } catch (dbErr) {
        console.warn("Failed to save enquiry to database:", dbErr.message);
      }
    }

    const settings = await getBackendSettings();

    // Send email only if enquiry email notifications are enabled
    if (settings.enquiryEmailNotifications !== "false" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const recipientEmail = settings.storeEmail || process.env.EMAIL_USER;
        await transporter.sendMail({
          from: `"${settings.storeName || "House of Phones"} Website" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          replyTo: email,
          subject: subject || `New Contact Message from ${name}`,
          text: `
New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject || "Not provided"}

Message:
${message}
          `,
        });
        console.log(`✉️ Contact email sent successfully from ${email} to ${recipientEmail}`);
      } catch (mailErr) {
        console.error("Failed to send contact notification email:", mailErr.message);
      }
    } else {
      console.log(`ℹ️ Contact email notification suppressed (disabled in store settings) for ${email}`);
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("CONTACT EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email.",
    });
  }
});

// ============================================
// CREATE ORDER
// ============================================

app.post("/api/orders", async (req, res) => {
  try {
    const {
      userId,
      orderId,
      date,
      items,
      address,
      delivery,
      payment,
      status,
      totals,
    } = req.body;

    console.log("📦 Incoming Order Request:", orderId, "from user:", userId, "email:", address?.email);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    if (!prisma) {
      console.error("❌ Prisma database client not available when placing order");
      return res.status(500).json({
        success: false,
        message: "Database connection unavailable. Cannot place order.",
      });
    }

    const settings = await getBackendSettings();

    // 0. Enforce Payment Method availability (e.g. COD)
    const paymentMode = String(payment?.mode || "cod").toLowerCase();
    const paymentMethodName = String(payment?.method || "").toLowerCase();
    const isCODOrder = paymentMode === "cod" || paymentMethodName.includes("cash") || paymentMethodName.includes("cod");

    if (isCODOrder && settings.cashOnDelivery === "false") {
      console.warn(`⛔ Rejected order #${orderId}: Cash on Delivery is currently disabled in store settings.`);
      return res.status(400).json({
        success: false,
        message: "Cash on Delivery is currently disabled by the store. Please choose an online payment method.",
      });
    }

    // 1. Resolve or create user safely by ID or by unique Email
    let user = null;
    try {
      // Check if user exists by ID
      user = await prisma.user.findUnique({ where: { id: userId } });

      // If not found by ID, check if user exists by email (to avoid duplicate email constraint)
      if (!user && address.email) {
        user = await prisma.user.findUnique({ where: { email: address.email } });
      }

      if (!user) {
        // Create user
        user = await prisma.user.create({
          data: {
            id: userId,
            email: address.email,
            name: address.fullName || null,
            phone: address.phone || null,
          },
        });
      } else {
        // User exists: update name/phone if not set
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name || address.fullName || undefined,
            phone: user.phone || address.phone || undefined,
          },
        });
      }
    } catch (userErr) {
      console.error("❌ Error resolving user in order placement:", userErr);
      return res.status(500).json({
        success: false,
        message: "Failed to resolve customer record in database",
        error: userErr.message,
      });
    }

    // 2. Ensure unique orderId (if HOP-xxx already exists, suffix timestamp)
    let finalOrderId = orderId;
    const existingOrder = await prisma.order.findUnique({ where: { orderId: finalOrderId } });
    if (existingOrder) {
      finalOrderId = `${orderId}-${Math.floor(1000 + Math.random() * 9000)}`;
      console.log(`⚠️ Order ID ${orderId} already exists. Using unique orderId: ${finalOrderId}`);
    }

    // 3. Save Address & Order inside a Prisma Transaction
    let savedOrder = null;
    try {
      savedOrder = await prisma.$transaction(async (tx) => {
        const savedAddress = await tx.address.create({
          data: {
            userId: user.id,
            fullName: address.fullName || "Valued Customer",
            phone: address.phone || "",
            email: address.email || "",
            line1: address.line1 || "",
            line2: address.line2 || null,
            city: address.city || "",
            pincode: address.pincode || "",
            state: address.state || "",
          },
        });

        return await tx.order.create({
          data: {
            orderId: finalOrderId,
            userId: user.id,
            date: date ? new Date(date) : new Date(),
            status: status || "Processing",
            subtotal: Number(totals?.subtotal || 0),
            gstIncluded: Number(totals?.gstIncluded || 0),
            shipping: Number(totals?.shipping || 0),
            total: Number(totals?.total || 0),
            tax: totals?.tax !== undefined && totals?.tax !== null ? Number(totals.tax) : null,
            deliveryLabel: delivery?.label || "Standard Delivery",
            deliveryFee: Number(delivery?.fee || 0),
            paymentMethod: payment?.method || "cod",
            paymentMode: payment?.mode || "cod",
            paymentStatus: payment?.status || (payment?.mode === "cod" ? "Pending" : "Completed"),
            addressId: savedAddress.id,
            items: {
              create: items.map((item) => ({
                productId: String(item.id || item.productId || "p-unknown"),
                name: String(item.name || "Product"),
                brand: String(item.brand || "House of Phones"),
                image: String(item.image || ""),
                price: Number(item.price || 0),
                qty: Number(item.qty || 1),
                color: item.color ? String(item.color) : null,
                storage: item.storage ? String(item.storage) : null,
              })),
            },
          },
          include: { items: true, address: true, user: true },
        });
      });

      console.log(`✅ Order ${finalOrderId} successfully saved to PostgreSQL database!`);
    } catch (dbErr) {
      console.error("❌ Critical: Failed to save order to PostgreSQL database:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Failed to save order to database",
        error: dbErr.message,
      });
    }

    // 4. Send order confirmation email only if orderEmailNotifications is enabled in store settings
    if (settings.orderEmailNotifications !== "false" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const storeRecipient = settings.storeEmail || process.env.EMAIL_USER;
        await transporter.sendMail({
          from: `"${settings.storeName || "House of Phones"}" <${process.env.EMAIL_USER}>`,
          to: `${address.email}, ${storeRecipient}`,
          subject: `Order Confirmation - #${finalOrderId}`,
          text: `
Thank you for your order at ${settings.storeName || "House of Phones"}!

Order ID: ${finalOrderId}
Customer: ${address.fullName}
Phone: ${address.phone}
Total Amount: ₹${totals?.total}
Payment Mode: ${payment?.mode || "COD"} (${payment?.method || "Cash on Delivery"})

Shipping Address:
${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.city}, ${address.state} - ${address.pincode}

Items Ordered:
${items.map((i) => `- ${i.name} (Qty: ${i.qty}) - ₹${Number(i.price) * Number(i.qty)}`).join("\n")}

We will process your order shortly!
          `,
        });
        console.log(`✉️ Order confirmation email sent for ${finalOrderId}`);
      } catch (emailErr) {
        console.error("⚠️ Failed to send order email:", emailErr.message);
      }
    } else {
      console.log(`ℹ️ Order confirmation email suppressed (orderEmailNotifications is disabled) for #${finalOrderId}`);
    }

    // 5. Return success with the actual saved PostgreSQL order
    createNotification("New Order", `Order ${savedOrder.orderId || savedOrder.id} placed — ₹${savedOrder.total}`, "success", "Orders", savedOrder.id);
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("❌ ORDER HANDLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process order",
      error: error.message,
    });
  }
});

// ============================================
// BRANDS API
// ============================================
app.get("/api/brands", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, brands });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/brands", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, slug, tagline, logo, description, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Brand name is required" });
    const safeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const brand = await prisma.brand.create({ data: { name, slug: safeSlug, tagline, logo, description, status: status || "Active" } });
    res.status(201).json({ success: true, brand });
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ success: false, message: "A brand with this name or slug already exists." });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/brands/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, slug, tagline, logo, description, status } = req.body;
    const brand = await prisma.brand.update({ where: { id: req.params.id }, data: { name, slug, tagline, logo, description, status } });
    res.json({ success: true, brand });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/brands/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Brand deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// CATEGORIES API
// ============================================
app.get("/api/categories", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
    res.json({ success: true, categories });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/categories", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, slug, description, image, icon, status, sortOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });
    const safeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.category.create({ data: { name, slug: safeSlug, description, image, icon, status: status || "Active", sortOrder: sortOrder || 0 } });
    res.status(201).json({ success: true, category });
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ success: false, message: "A category with this name or slug already exists." });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, slug, description, image, icon, status, sortOrder } = req.body;
    const category = await prisma.category.update({ where: { id: req.params.id }, data: { name, slug, description, image, icon, status, sortOrder } });
    res.json({ success: true, category });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Category deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// PRODUCTS API
// ============================================
app.get("/api/products", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status, category, brand, type } = req.query;
    const AND = [];

    if (search) {
      AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { brand: { name: { contains: search, mode: "insensitive" } } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (status && status !== "All Status" && status !== "All") {
      AND.push({ status });
    }

    if (type && type !== "All Types" && type !== "All") {
      AND.push({ type });
    }

    if (category && category !== "All Categories" && category !== "All") {
      AND.push({
        OR: [
          { categoryId: category },
          { category: { name: { equals: category, mode: "insensitive" } } },
          { category: { slug: { equals: category, mode: "insensitive" } } },
        ],
      });
    }

    if (brand && brand !== "All Brands" && brand !== "All") {
      AND.push({
        OR: [
          { brandId: brand },
          { brand: { name: { equals: brand, mode: "insensitive" } } },
          { brand: { slug: { equals: brand, mode: "insensitive" } } },
        ],
      });
    }

    const where = AND.length > 0 ? { AND } : {};
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { brand: true, category: true },
    });
    res.json({ success: true, products });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const product = await prisma.product.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }] }, include: { brand: true, category: true, reviews: true } });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/products", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, slug, brandId, categoryId, description, price, mrp, sku, stock, image, images, colors, storage, ram, type, status, featured, badge, highlights, tags } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Product name is required" });
    if (!price) return res.status(400).json({ success: false, message: "Price is required" });
    const safeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const product = await prisma.product.create({
      data: { name, slug: safeSlug, brandId: brandId || null, categoryId: categoryId || null, description, price: Number(price), mrp: Number(mrp || price), sku, stock: Number(stock || 0), image, images: images || [], colors: colors || [], storage: storage || [], ram, type, status: status || "Active", featured: Boolean(featured), badge, highlights: highlights || [], tags: tags || [] },
      include: { brand: true, category: true }
    });
    res.status(201).json({ success: true, product });
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ success: false, message: "A product with this slug or SKU already exists." });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, slug, brandId, categoryId, description, price, mrp, sku, stock, image, images, colors, storage, ram, type, status, featured, badge, highlights, tags } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, slug, brandId: brandId || null, categoryId: categoryId || null, description, price: price !== undefined ? Number(price) : undefined, mrp: mrp !== undefined ? Number(mrp) : undefined, sku, stock: stock !== undefined ? Number(stock) : undefined, image, images, colors, storage, ram, type, status, featured: featured !== undefined ? Boolean(featured) : undefined, badge, highlights, tags },
      include: { brand: true, category: true }
    });
    res.json({ success: true, product });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Product deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// INVENTORY API
// ============================================
app.get("/api/inventory", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, stockStatus } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }];
    if (stockStatus === "In Stock") where.stock = { gt: 5 };
    if (stockStatus === "Low Stock") where.stock = { gt: 0, lte: 5 };
    if (stockStatus === "Out of Stock") where.stock = 0;
    const products = await prisma.product.findMany({ where, orderBy: { name: "asc" }, include: { brand: true } });
    res.json({ success: true, products });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/inventory/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { change, reason, staffNote } = req.body;
    if (change === undefined) return res.status(400).json({ success: false, message: "Stock change amount is required" });
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });
    const newStock = Math.max(0, existing.stock + Number(change));
    const [product] = await prisma.$transaction([
      prisma.product.update({ where: { id: req.params.id }, data: { stock: newStock } }),
      prisma.inventoryLog.create({ data: { productId: req.params.id, change: Number(change), reason, staffNote } }),
    ]);
    res.json({ success: true, product, newStock });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/api/inventory/:id/logs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const logs = await prisma.inventoryLog.findMany({ where: { productId: req.params.id }, orderBy: { createdAt: "desc" } });
    res.json({ success: true, logs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// CUSTOMERS API
// ============================================
app.get("/api/customers", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }];
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, include: { _count: { select: { orders: true } }, orders: { select: { total: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 } } });
    const customers = users.map(u => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone, status: u.status || "Active",
      orderCount: u._count.orders, totalSpent: u.orders.reduce ? 0 : 0,
      lastOrder: u.orders[0]?.createdAt || null, createdAt: u.createdAt,
    }));
    res.json({ success: true, customers });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { addresses: true, orders: { orderBy: { date: "desc" }, include: { items: true, address: true } } } });
    if (!user) return res.status(404).json({ success: false, message: "Customer not found" });
    const { password: _pw, ...safe } = user;
    res.json({ success: true, customer: safe });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/customers/:id/status", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status } });
    res.json({ success: true, customer: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// OFFERS API
// ============================================
app.get("/api/offers", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const offers = await prisma.offer.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, offers });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/offers", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { title, description, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, status, applicableTo } = req.body;
    if (!title || !discountValue) return res.status(400).json({ success: false, message: "Title and discount value are required" });
    const offer = await prisma.offer.create({ data: { title, description, discountType: discountType || "percentage", discountValue: Number(discountValue), minOrderValue: minOrderValue ? Number(minOrderValue) : null, maxDiscount: maxDiscount ? Number(maxDiscount) : null, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, status: status || "Active", applicableTo: applicableTo || "all" } });
    res.status(201).json({ success: true, offer });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/api/offers/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { title, description, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, status, applicableTo } = req.body;
    const offer = await prisma.offer.update({ where: { id: req.params.id }, data: { title, description, discountType, discountValue: discountValue ? Number(discountValue) : undefined, minOrderValue: minOrderValue ? Number(minOrderValue) : null, maxDiscount: maxDiscount ? Number(maxDiscount) : null, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, status, applicableTo } });
    res.json({ success: true, offer });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/offers/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.offer.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Offer deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// COUPONS API
// ============================================
app.get("/api/coupons", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, coupons });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/coupons", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { code, discountType, discountValue, minOrder, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startDate, expiryDate, status } = req.body;
    if (!code || discountValue === undefined || discountValue === null || discountValue === "") return res.status(400).json({ success: false, message: "Coupon code and discount value are required" });
    const effectiveMinOrder = minOrder !== undefined ? minOrder : minOrderAmount;
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || "percentage",
        discountValue: Number(discountValue),
        minOrder: effectiveMinOrder ? Number(effectiveMinOrder) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: perUserLimit ? Number(perUserLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: status || "Active",
      },
    });
    res.status(201).json({ success: true, coupon });
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ success: false, message: "A coupon with this code already exists." });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/coupons/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { code, discountType, discountValue, minOrder, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startDate, expiryDate, status } = req.body;
    const effectiveMinOrder = minOrder !== undefined ? minOrder : minOrderAmount;
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        code: code?.toUpperCase()?.trim(),
        discountType,
        discountValue: discountValue !== undefined && discountValue !== null && discountValue !== "" ? Number(discountValue) : undefined,
        minOrder: effectiveMinOrder !== undefined ? (effectiveMinOrder ? Number(effectiveMinOrder) : null) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : undefined,
        perUserLimit: perUserLimit !== undefined ? (perUserLimit ? Number(perUserLimit) : null) : undefined,
        startDate: startDate ? new Date(startDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status,
      },
    });
    res.json({ success: true, coupon });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/coupons/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// BANNERS API
// ============================================
app.get("/api/banners", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ success: true, banners });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/banners", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { title, description, subtitle, image, buttonText, link, startDate, endDate, sortOrder, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Banner title is required" });
    const effectiveDesc = description !== undefined ? description : subtitle;
    const banner = await prisma.banner.create({
      data: {
        title,
        description: effectiveDesc || null,
        image: image || null,
        buttonText: buttonText || null,
        link: link || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sortOrder: Number(sortOrder || 0),
        status: status || "Active",
      },
    });
    res.status(201).json({ success: true, banner });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/api/banners/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { title, description, subtitle, image, buttonText, link, startDate, endDate, sortOrder, status } = req.body;
    const effectiveDesc = description !== undefined ? description : subtitle;
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        title,
        description: effectiveDesc !== undefined ? (effectiveDesc || null) : undefined,
        image: image !== undefined ? (image || null) : undefined,
        buttonText: buttonText !== undefined ? (buttonText || null) : undefined,
        link: link !== undefined ? (link || null) : undefined,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
        status,
      },
    });
    res.json({ success: true, banner });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/banners/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Banner deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// BLOG API
// ============================================
app.get("/api/blog", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status } = req.query;
    const where = {};
    if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { author: { contains: search, mode: "insensitive" } }];
    if (status && status !== "All") where.status = status;
    const posts = await prisma.blogPost.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ success: true, posts });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/blog", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { title, slug, content, featuredImage, author, status, publishDate } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Blog title is required" });
    const safeSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
    const post = await prisma.blogPost.create({ data: { title, slug: safeSlug, content, featuredImage, author, status: status || "Draft", publishDate: publishDate ? new Date(publishDate) : null } });
    res.status(201).json({ success: true, post });
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ success: false, message: "A blog post with this slug already exists." });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/blog/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { title, slug, content, featuredImage, author, status, publishDate } = req.body;
    const post = await prisma.blogPost.update({ where: { id: req.params.id }, data: { title, slug, content, featuredImage, author, status, publishDate: publishDate ? new Date(publishDate) : null } });
    res.json({ success: true, post });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/blog/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Blog post deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// FAQs API
// ============================================
app.get("/api/faqs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const faqs = await prisma.fAQ.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    res.json({ success: true, faqs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/faqs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { question, answer, category, sortOrder, status } = req.body;
    if (!question || !answer) return res.status(400).json({ success: false, message: "Question and answer are required" });
    const faq = await prisma.fAQ.create({ data: { question, answer, category, sortOrder: Number(sortOrder || 0), status: status || "Active" } });
    res.status(201).json({ success: true, faq });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/api/faqs/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { question, answer, category, sortOrder, status } = req.body;
    const faq = await prisma.fAQ.update({ where: { id: req.params.id }, data: { question, answer, category, sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined, status } });
    res.json({ success: true, faq });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/faqs/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.fAQ.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "FAQ deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// REVIEWS API
// ============================================
app.get("/api/reviews", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;
    if (search) where.OR = [{ customerName: { contains: search, mode: "insensitive" } }, { title: { contains: search, mode: "insensitive" } }];
    const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: "desc" }, include: { product: { select: { name: true, image: true } }, user: { select: { name: true, email: true } } } });
    res.json({ success: true, reviews });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/reviews", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { productId, customerName, rating, title, body, status, featured } = req.body;
    if (!productId || !rating) return res.status(400).json({ success: false, message: "Product ID and rating are required" });
    const review = await prisma.review.create({
      data: {
        productId,
        customerName: customerName || "Customer",
        rating: Number(rating),
        title: title || null,
        body: body || null,
        status: status || "Pending",
        featured: Boolean(featured),
      },
      include: {
        product: { select: { name: true, image: true } },
      },
    });
    createNotification("New Review", `${customerName || "Customer"} left a ${rating}-star review`, "info", "Reviews", review.id);
    res.status(201).json({ success: true, review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/api/reviews/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { customerName, rating, title, body, status, featured } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        customerName,
        rating: rating ? Number(rating) : undefined,
        title,
        body,
        status,
        featured: featured !== undefined ? Boolean(featured) : undefined,
      },
      include: {
        product: { select: { name: true, image: true } },
      },
    });
    res.json({ success: true, review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/reviews/:id/status", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status, featured } = req.body;
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { status, featured: featured !== undefined ? Boolean(featured) : undefined } });
    res.json({ success: true, review });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/reviews/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Review deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// RETURNS API
// ============================================
app.get("/api/returns", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status, userId } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;
    if (userId) where.userId = userId;
    if (search) where.OR = [{ customerName: { contains: search, mode: "insensitive" } }, { returnId: { contains: search, mode: "insensitive" } }, { productName: { contains: search, mode: "insensitive" } }];
    const returns = await prisma.return.findMany({ where, orderBy: { createdAt: "desc" }, include: { order: { select: { orderId: true, status: true, total: true } } } });
    res.json({ success: true, returns });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/returns", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { orderId, customerName, customerEmail, productName, reason, description, refundAmount, userId } = req.body;
    if (!orderId || !customerName || !productName || !reason) return res.status(400).json({ success: false, message: "Order ID, customer name, product name and reason are required" });
    const order = await prisma.order.findFirst({ where: { OR: [{ id: orderId }, { orderId: orderId }] } });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    // Only allow returns for delivered orders
    if ((order.status || "").toLowerCase() !== "delivered") {
      return res.status(400).json({ success: false, message: "Returns can only be requested for delivered orders." });
    }
    // Prevent duplicate active return requests for the same order
    const existingReturn = await prisma.return.findFirst({
      where: { orderId: order.id, status: { in: ["Requested", "Approved", "Pickup Scheduled", "Picked Up"] } },
    });
    if (existingReturn) {
      return res.status(400).json({ success: false, message: "A return request already exists for this order." });
    }
    const ret = await prisma.return.create({ data: { orderId: order.id, userId: userId || null, customerName, customerEmail, productName, reason, description, refundAmount: refundAmount ? Number(refundAmount) : null } });
    createNotification("Return Requested", `${customerName} requested a return for "${productName}" — ${reason}`, "warning", "Returns", ret.id);
    res.status(201).json({ success: true, return: ret });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/returns/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status, refundStatus, refundAmount, adminNotes } = req.body;
    const ret = await prisma.return.update({ where: { id: req.params.id }, data: { status, refundStatus, refundAmount: refundAmount ? Number(refundAmount) : undefined, adminNotes } });
    res.json({ success: true, return: ret });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// REPAIRS API
// ============================================
app.get("/api/repairs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;
    if (search) where.OR = [{ customerName: { contains: search, mode: "insensitive" } }, { repairId: { contains: search, mode: "insensitive" } }, { deviceName: { contains: search, mode: "insensitive" } }];
    const repairs = await prisma.repair.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ success: true, repairs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/repairs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { orderId, customerName, customerEmail, customerPhone, deviceName, issue, description, estimatedCost, technician } = req.body;
    if (!customerName || !deviceName || !issue) return res.status(400).json({ success: false, message: "Customer name, device and issue are required" });
    let orderDbId = null;
    if (orderId) { const order = await prisma.order.findFirst({ where: { OR: [{ id: orderId }, { orderId: orderId }] } }); if (order) orderDbId = order.id; }
    const repair = await prisma.repair.create({ data: { orderId: orderDbId, customerName, customerEmail, customerPhone, deviceName, issue, description, estimatedCost: estimatedCost ? Number(estimatedCost) : null, technician } });

    // Send owner notification email for new repair request if enquiry notifications are enabled
    const settings = await getBackendSettings();
    if (settings.enquiryEmailNotifications !== "false" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const recipientEmail = settings.storeEmail || process.env.EMAIL_USER;
        await transporter.sendMail({
          from: `"${settings.storeName || "House of Phones"}" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: `New Repair Service Request — ${settings.storeName || "House of Phones"}`,
          text: `A new repair request has been submitted.

Customer: ${customerName}
Email: ${customerEmail || "Not provided"}
Phone: ${customerPhone || "Not provided"}
Repair Request ID: ${repair.repairId}

Device: ${deviceName}
Issue: ${issue}
Description: ${description || "None provided"}
Estimated Cost: ${estimatedCost ? `₹${estimatedCost}` : "Pending evaluation"}

Please review the request in the Admin Panel.`,
        });
        console.log(`Repair owner notification email sent for ${repair.repairId}`);
      } catch (emailErr) {
        console.error(`Failed to send repair owner notification email:`, emailErr.message);
      }
    }

    createNotification("Repair Request", `${customerName} requested repair for "${deviceName}" — ${issue}`, "info", "Repairs", repair.id);
    res.status(201).json({ success: true, repair });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/repairs/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status, estimatedCost, finalCost, technician, adminNotes } = req.body;

    // Fetch existing repair to check for status transition and email prevention
    const existingRepair = await prisma.repair.findUnique({ where: { id: req.params.id } });
    if (!existingRepair) return res.status(404).json({ success: false, message: "Repair request not found" });

    const updateData = {
      status,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      finalCost: finalCost ? Number(finalCost) : undefined,
      technician,
      adminNotes,
    };

    // Send customer acceptance email ONLY when transitioning to "Accepted" and email not yet sent
    const isAccepting = status === "Accepted" && existingRepair.status !== "Accepted";
    if (isAccepting && !existingRepair.acceptanceEmailSent && existingRepair.customerEmail) {
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          await transporter.sendMail({
            from: `"House of Phones" <${process.env.EMAIL_USER}>`,
            to: existingRepair.customerEmail,
            subject: `Repair Request Accepted — House of Phones`,
            text: `Hello ${existingRepair.customerName},

Good news! Your repair request has been accepted by House of Phones.

Our team will proceed with your repair request and will contact you regarding the next steps.

Repair Request ID: ${existingRepair.repairId}

Thank you,
House of Phones`,
          });
          console.log(`Repair acceptance email sent to ${existingRepair.customerEmail} for ${existingRepair.repairId}`);
          updateData.acceptanceEmailSent = true;
        }
      } catch (emailErr) {
        console.error(`Failed to send repair acceptance email for ${existingRepair.repairId}:`, emailErr.message);
        // Do NOT block the repair update if email fails
      }
    }

    const repair = await prisma.repair.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, repair });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// EXCHANGES API
// ============================================
app.get("/api/exchanges", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;
    if (search) where.OR = [{ customerName: { contains: search, mode: "insensitive" } }, { exchangeId: { contains: search, mode: "insensitive" } }];
    const exchanges = await prisma.exchange.findMany({ where, orderBy: { createdAt: "desc" }, include: { order: { select: { orderId: true } } } });
    res.json({ success: true, exchanges });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/exchanges", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { orderId, customerName, customerEmail, productName, reason, requestedReplacement } = req.body;
    if (!customerName || !productName || !reason) return res.status(400).json({ success: false, message: "Customer name, product and reason are required" });
    let orderDbId = null;
    if (orderId) { const order = await prisma.order.findFirst({ where: { OR: [{ id: orderId }, { orderId: orderId }] } }); if (order) orderDbId = order.id; }
    const exchange = await prisma.exchange.create({ data: { orderId: orderDbId, customerName, customerEmail, productName, reason, requestedReplacement } });
    createNotification("Exchange Request", `${customerName} requested an exchange for "${productName}" — ${reason}`, "info", "Exchanges", exchange.id);
    res.status(201).json({ success: true, exchange });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/exchanges/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status, adminNotes } = req.body;
    const exchange = await prisma.exchange.update({ where: { id: req.params.id }, data: { status, adminNotes } });
    res.json({ success: true, exchange });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// STORES API
// ============================================
app.get("/api/stores", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const stores = await prisma.store.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, stores });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/stores", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, address, city, state, pincode, phone, email, openingHours, closingHours, mapLink, status } = req.body;
    if (!name || !address || !city) return res.status(400).json({ success: false, message: "Store name, address and city are required" });
    const store = await prisma.store.create({ data: { name, address, city, state: state || "", pincode: pincode || "", phone, email, openingHours, closingHours, mapLink, status: status || "Active" } });
    res.status(201).json({ success: true, store });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put("/api/stores/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, address, city, state, pincode, phone, email, openingHours, closingHours, mapLink, status } = req.body;
    const store = await prisma.store.update({ where: { id: req.params.id }, data: { name, address, city, state, pincode, phone, email, openingHours, closingHours, mapLink, status } });
    res.json({ success: true, store });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/stores/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.store.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Store deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// ENQUIRIES API
// ============================================
app.get("/api/enquiries", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;
    if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { subject: { contains: search, mode: "insensitive" } }];
    const enquiries = await prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ success: true, enquiries });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/enquiries/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status, adminNotes } = req.body;
    const enquiry = await prisma.enquiry.update({ where: { id: req.params.id }, data: { status, adminNotes } });
    res.json({ success: true, enquiry });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/enquiries/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.enquiry.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Enquiry deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// CORPORATE ENQUIRIES API
// ============================================
app.get("/api/corporate", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, status } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;
    if (search) where.OR = [{ companyName: { contains: search, mode: "insensitive" } }, { contactPerson: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
    const enquiries = await prisma.corporateEnquiry.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ success: true, enquiries });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/corporate", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { companyName, contactPerson, email, phone, requirement, message } = req.body;
    if (!companyName || !contactPerson || !email) return res.status(400).json({ success: false, message: "Company name, contact person and email are required" });
    const enquiry = await prisma.corporateEnquiry.create({ data: { companyName, contactPerson, email, phone, requirement, message } });

    // Send notification email to admin if enquiry notifications are enabled
    const settings = await getBackendSettings();
    if (settings.enquiryEmailNotifications !== "false" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const recipientEmail = settings.storeEmail || process.env.EMAIL_USER;
        await transporter.sendMail({
          from: `"${settings.storeName || "House of Phones"}" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: `New Corporate / Bulk Order Enquiry from ${companyName}`,
          text: `A new corporate enquiry has been submitted.

Company Name: ${companyName}
Contact Person: ${contactPerson}
Email: ${email}
Phone: ${phone || "Not provided"}
Requirement: ${requirement || "Not specified"}

Message:
${message || "None provided"}

Please review in the Admin Panel.`,
        });
        console.log(`Corporate enquiry notification email sent for ${companyName}`);
      } catch (mailErr) {
        console.error("Failed to send corporate notification email:", mailErr.message);
      }
    }

    createNotification("Corporate Enquiry", `${companyName} — ${contactPerson} submitted a B2B enquiry`, "info", "Corporate", enquiry.id);
    res.status(201).json({ success: true, enquiry });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/corporate/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { status, adminNotes } = req.body;
    const enquiry = await prisma.corporateEnquiry.update({ where: { id: req.params.id }, data: { status, adminNotes } });
    res.json({ success: true, enquiry });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// STAFF API
// ============================================
app.get("/api/staff", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const staff = await prisma.staff.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true } });
    res.json({ success: true, staff });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/staff", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, email, phone, role, password, status } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email and password are required" });
    // SECURITY: Use bcrypt (not SHA-256) for staff password hashing
    const hashed = await bcrypt.hash(password, 10);
    const staff = await prisma.staff.create({ data: { name, email, phone, role: role || "Staff", password: hashed, status: status || "Active" }, select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true } });
    res.status(201).json({ success: true, staff });
  } catch (e) {
    if (e.code === "P2002") return res.status(400).json({ success: false, message: "A staff member with this email already exists." });
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/staff/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { name, email, phone, role, status, password } = req.body;
    const updateData = { name, email, phone, role, status };
    if (password) {
      // SECURITY: Use bcrypt (not SHA-256) for staff password hashing
      updateData.password = await bcrypt.hash(password, 10);
    }
    const staff = await prisma.staff.update({ where: { id: req.params.id }, data: updateData, select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true } });
    res.json({ success: true, staff });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete("/api/staff/:id", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.staff.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Staff member deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Change admin/staff password (used by Settings → Security)
app.post("/api/staff/change-password", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }
    // Find the first active staff member (admin)
    const staff = await prisma.staff.findFirst({ where: { status: "Active" }, orderBy: { createdAt: "asc" } });
    if (!staff) {
      return res.status(404).json({ success: false, message: "No active staff account found." });
    }
    // Verify current password
    const bcrypt = require("bcryptjs");
    const valid = await bcrypt.compare(currentPassword, staff.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }
    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.staff.update({ where: { id: staff.id }, data: { password: hashed } });
    // Record last password change timestamp
    const now = new Date().toISOString();
    await prisma.setting.upsert({ where: { key: "lastPasswordChange" }, update: { value: now }, create: { key: "lastPasswordChange", value: now } });
    res.json({ success: true, message: "Password updated successfully." });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// ACTIVITY LOGS API
// ============================================
app.get("/api/activity-logs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { search, module, page = "1", limit = "50" } = req.query;
    const where = {};
    if (module && module !== "All") where.module = module;
    if (search) where.OR = [{ description: { contains: search, mode: "insensitive" } }, { staffName: { contains: search, mode: "insensitive" } }, { action: { contains: search, mode: "insensitive" } }];
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: Number(limit), include: { staff: { select: { name: true } } } }),
      prisma.activityLog.count({ where }),
    ]);
    res.json({ success: true, logs, total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/api/activity-logs", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const { staffId, staffName, action, module, recordId, description } = req.body;
    const log = await prisma.activityLog.create({ data: { staffId: staffId || null, staffName: staffName || "Admin", action, module, recordId, description } });
    res.status(201).json({ success: true, log });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// SETTINGS API
// ============================================
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await getBackendSettings();
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const updatedKeys = [];

    for (const [key, value] of Object.entries(req.body)) {
      if (!allowedKeys.includes(key)) continue;
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      updatedKeys.push(key);
    }

    // Log admin settings change to Activity Log
    if (updatedKeys.length > 0) {
      try {
        await prisma.activityLog.create({
          data: {
            staffName: "Admin",
            action: "Update Settings",
            module: "Settings",
            description: `Updated store configuration settings (${updatedKeys.length} settings modified)`,
          },
        });
      } catch (logErr) {
        console.warn("Could not log settings activity:", logErr.message);
      }
    }

    const updatedSettings = await getBackendSettings();
    console.log(`✅ Store settings updated (${updatedKeys.length} items)`);
    res.json({ success: true, message: "Settings saved successfully", settings: updatedSettings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============================================
// NOTIFICATIONS API
// ============================================
app.get("/api/notifications", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });
    res.json({ success: true, notifications, unreadCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/api/notifications/unread-count", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });
    res.json({ success: true, unreadCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });
    res.json({ success: true, notification, unreadCount });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.patch("/api/notifications/read-all", async (req, res) => {
  try {
    if (!prisma) return res.status(500).json({ success: false, message: "DB not available" });
    await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    res.json({ success: true, unreadCount: 0 });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ============================================
// AI ASSISTANT API
// ============================================
const AI_API_KEY = process.env.AI_API_KEY || "";

function buildAdminContext(message) {
  const lower = message.toLowerCase();
  const ctx = { data: {}, hints: [] };

  const wantOrders = /\b(order|orders|order\s*kitne|aaj.*order|today.*order|recent.*order|pending.*order)/i.test(lower);
  const wantProducts = /\b(product|products|item|items|stock|inventory|low\s*stock|out\s*of\s*stock)/i.test(lower);
  const wantCustomers = /\b(customer|customers|user|users|register|registered|recent.*customer)/i.test(lower);
  const wantPayments = /\b(payment|payments|revenue|sales|income|COD|cod)/i.test(lower);
  const wantDashboard = /\b(dashboard|stats|summary|overview|total)/i.test(lower);
  const wantCategories = /\b(categor|categories)/i.test(lower);
  const wantBrands = /\b(brand|brands)/i.test(lower);
  const wantOffers = /\b(offer|offers|discount|coupon)/i.test(lower);
  const wantReviews = /\b(review|reviews|rating)/i.test(lower);
  const wantReturns = /\b(return|refund)/i.test(lower);
  const wantStaff = /\b(staff|team)/i.test(lower);

  if (wantOrders || wantDashboard) ctx.hints.push("orders");
  if (wantProducts || wantDashboard) ctx.hints.push("products");
  if (wantCustomers || wantDashboard) ctx.hints.push("customers");
  if (wantPayments || wantDashboard) ctx.hints.push("payments");
  if (wantDashboard) ctx.hints.push("dashboard");
  if (wantCategories) ctx.hints.push("categories");
  if (wantBrands) ctx.hints.push("brands");
  if (wantOffers) ctx.hints.push("offers");
  if (wantReviews) ctx.hints.push("reviews");
  if (wantReturns) ctx.hints.push("returns");
  if (wantStaff) ctx.hints.push("staff");

  if (ctx.hints.length === 0) ctx.hints.push("dashboard", "products", "orders");

  return ctx;
}

async function fetchAdminData(hints) {
  if (!prisma) return {};
  const data = {};
  try {
    if (hints.includes("dashboard") || hints.includes("orders")) {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { items: true, address: true } });
      const statusCounts = {};
      orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
      data.orders = { total: orders.length, statusCounts, recent: orders.slice(0, 10).map(o => ({ orderId: o.orderId, status: o.status, total: o.total, date: o.createdAt, customer: o.address?.fullName || "N/A", items: o.items?.length || 0 })) };
    }
    if (hints.includes("products")) {
      const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { brand: true, category: true } });
      const outOfStock = products.filter(p => p.stock <= 0);
      const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
      data.products = { total: products.length, outOfStock: outOfStock.length, lowStock: lowStock.length, outOfStockList: outOfStock.slice(0, 5).map(p => ({ name: p.name, sku: p.sku, stock: p.stock })), lowStockList: lowStock.slice(0, 5).map(p => ({ name: p.name, sku: p.sku, stock: p.stock })), recent: products.slice(0, 10).map(p => ({ name: p.name, price: p.price, mrp: p.mrp, stock: p.stock, status: p.status, brand: p.brand?.name, category: p.category?.name })) };
    }
    if (hints.includes("customers")) {
      const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, name: true, email: true, createdAt: true, status: true } });
      const totalUsers = await prisma.user.count();
      data.customers = { total: totalUsers, recent: users.map(u => ({ name: u.name, email: u.email, joined: u.createdAt, status: u.status })) };
    }
    if (hints.includes("payments")) {
      const orders = await prisma.order.findMany({ select: { total: true, paymentMethod: true, paymentStatus: true, status: true } });
      let totalRevenue = 0;
      const methodCounts = {};
      orders.forEach(o => { totalRevenue += o.total || 0; methodCounts[o.paymentMethod || "Unknown"] = (methodCounts[o.paymentMethod || "Unknown"] || 0) + 1; });
      data.payments = { totalRevenue, totalOrders: orders.length, methodBreakdown: methodCounts };
    }
    if (hints.includes("categories")) {
      const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
      data.categories = cats.map(c => ({ name: c.name, status: c.status }));
    }
    if (hints.includes("brands")) {
      const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
      data.brands = brands.map(b => ({ name: b.name, status: b.status }));
    }
    if (hints.includes("offers")) {
      const offers = await prisma.offer.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
      data.offers = offers.map(o => ({ title: o.title, discount: o.discountValue, type: o.discountType, status: o.status }));
    }
    if (hints.includes("reviews")) {
      const totalReviews = await prisma.review.count();
      const avgResult = await prisma.review.aggregate({ _avg: { rating: true } });
      data.reviews = { total: totalReviews, averageRating: avgResult._avg.rating || 0 };
    }
    if (hints.includes("returns")) {
      const returns = await prisma.return.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
      data.returns = returns.map(r => ({ orderId: r.orderId, product: r.productName, status: r.status, refundStatus: r.refundStatus }));
    }
    if (hints.includes("staff")) {
      const staff = await prisma.staff.findMany({ select: { name: true, email: true, role: true, status: true } });
      data.staff = staff.map(s => ({ name: s.name, role: s.role, status: s.status }));
    }
  } catch (e) {
    console.warn("AI context fetch error:", e.message);
  }
  return data;
}

function callOpenAI(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });
    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || "AI API error"));
          const reply = parsed.choices?.[0]?.message?.content;
          if (!reply) return reject(new Error("No response from AI"));
          resolve(reply);
        } catch (e) { reject(new Error("Failed to parse AI response")); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("AI request timed out")); });
    req.write(body);
    req.end();
  });
}

app.post("/api/ai/chat", requireAuth, async (req, res) => {
  try {
    if (!AI_API_KEY) {
      return res.status(500).json({ success: false, message: "AI service not configured. Please set AI_API_KEY in server environment." });
    }
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: "Message too long. Please keep it under 2000 characters." });
    }

    const context = buildAdminContext(message);
    const adminData = await fetchAdminData(context.hints);

    const systemPrompt = `You are an AI assistant built into the "House of Phones" CMS Admin Panel. You help the store admin manage their e-commerce business.

CRITICAL RULES:
- You MUST respond in the SAME LANGUAGE as the user's message. If the user writes in Hindi (Devanagari), respond in Hindi. If they write in Hinglish (Hindi written in English script), respond in Hinglish. If they write in Marathi, respond in Marathi. If they write in English, respond in English.
- You are an admin assistant — you help with products, orders, customers, inventory, payments, offers, coupons, brands, categories, reviews, returns, repairs, exchanges, stores, enquiries, staff, and general admin panel usage.
- When the user asks about data (orders, products, customers, etc.), use the REAL DATA provided below to answer.
- Be concise, helpful, and professional. Use bullet points and formatting when appropriate.
- If you cannot find specific data, say so honestly. Do NOT make up data.
- If the user asks how to do something in the admin panel, guide them with clear step-by-step instructions.
- Never reveal API keys, passwords, database credentials, or internal system configuration.
- For actions that change data (delete, update stock, etc.), explain the steps rather than claiming to have done it.
- Keep responses short and focused (under 300 words unless more detail is needed).

ADMIN PANEL SECTIONS:
Dashboard, Orders, Payments, Products, Inventory, Customers, Brands, Categories, Offers, Coupons, Banners, Blog, FAQs, Reviews, Returns & Refunds, Repairs, Exchanges, Stores, Enquiries, Corporate, Staff, Activity Logs, Settings.

CURRENT STORE DATA:
${JSON.stringify(adminData, null, 2).slice(0, 8000)}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message.trim() },
    ];

    const reply = await callOpenAI(messages);
    res.json({ success: true, reply });
  } catch (e) {
    console.error("AI chat error:", e.message);
    if (e.message.includes("API key")) {
      return res.status(500).json({ success: false, message: "AI service configuration error. Please check server setup." });
    }
    if (e.message.includes("timed out")) {
      return res.status(504).json({ success: false, message: "AI service timed out. Please try again." });
    }
    res.status(500).json({ success: false, message: "AI service is temporarily unavailable. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});