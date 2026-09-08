const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

let PrismaClient;
let PrismaPg;

try {
  PrismaClient = require("@prisma/client").PrismaClient;
} catch (e1) {
  try {
    PrismaClient = require("./generated/prisma/client").PrismaClient;
  } catch (e2) {
    console.warn("PrismaClient unavailable. Continuing without DB connection.");
  }
}

try {
  PrismaPg = require("@prisma/adapter-pg").PrismaPg;
} catch (e) {
  // Optional adapter loading
}

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ============================================
// PRISMA + POSTGRESQL (SAFE INIT)
// ============================================

let prisma = null;

if (PrismaClient) {
  try {
    if (PrismaPg && process.env.DATABASE_URL) {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      });
      prisma = new PrismaClient({ adapter });
    } else {
      prisma = new PrismaClient();
    }
  } catch (err) {
    console.warn("Could not initialize Prisma instance:", err.message);
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
      } catch (dbErr) {
        console.warn("Failed to save enquiry to database:", dbErr.message);
      }
    }

    await transporter.sendMail({
      from: `"House of Phones Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: subject || `New Contact Message from ${name}`,
      text: `
New contact form submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject || "Not provided"}

Message:
${message}
      `,
    });

    console.log(`Contact email sent successfully from ${email}`);

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

    console.log("Received order:", orderId);

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

    let savedOrder = null;

    if (prisma) {
      try {
        const user = await prisma.user.upsert({
          where: { id: userId },
          update: { email: address.email, name: address.fullName },
          create: { id: userId, email: address.email, name: address.fullName },
        });

        const savedAddress = await prisma.address.create({
          data: {
            userId: user.id,
            fullName: address.fullName,
            phone: address.phone,
            email: address.email,
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            pincode: address.pincode,
            state: address.state,
          },
        });

        savedOrder = await prisma.order.create({
          data: {
            orderId: orderId,
            userId: user.id,
            date: date ? new Date(date) : new Date(),
            status: status || "Processing",
            subtotal: Number(totals.subtotal),
            gstIncluded: Number(totals.gstIncluded),
            shipping: Number(totals.shipping),
            total: Number(totals.total),
            tax: totals.tax !== undefined && totals.tax !== null ? Number(totals.tax) : null,
            deliveryLabel: delivery.label,
            deliveryFee: Number(delivery.fee),
            paymentMethod: payment.method,
            paymentMode: payment.mode,
            paymentStatus: payment.status,
            addressId: savedAddress.id,
            items: {
              create: items.map((item) => ({
                productId: item.id,
                name: item.name,
                brand: item.brand,
                image: item.image,
                price: Number(item.price),
                qty: Number(item.qty),
                color: item.color || null,
                storage: item.storage || null,
              })),
            },
          },
          include: { items: true, address: true },
        });
      } catch (dbErr) {
        console.warn("Database save skipped or failed:", dbErr.message);
      }
    }

    // Send order confirmation email via Nodemailer
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"House of Phones" <${process.env.EMAIL_USER}>`,
          to: `${address.email}, ${process.env.EMAIL_USER}`,
          subject: `Order Confirmation - #${orderId}`,
          text: `
Thank you for your order at House of Phones!

Order ID: ${orderId}
Customer: ${address.fullName}
Phone: ${address.phone}
Total Amount: ₹${totals.total}
Payment Mode: ${payment.mode} (${payment.method})

Shipping Address:
${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.city}, ${address.state} - ${address.pincode}

Items Ordered:
${items.map((i) => `- ${i.name} (Qty: ${i.qty}) - ₹${i.price * i.qty}`).join("\n")}

We will process your order shortly!
          `,
        });
        console.log(`Order confirmation email sent for ${orderId}`);
      }
    } catch (emailErr) {
      console.error("Failed to send order email:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Order processed successfully",
      order: savedOrder || { orderId, userId, items, address, totals },
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process order",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});