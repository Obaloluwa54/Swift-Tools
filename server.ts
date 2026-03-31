import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Paystack Verification Route
  app.post("/api/paystack/verify", async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ status: "error", message: "Reference is required" });
    }

    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      
      if (!secretKey) {
        console.error("PAYSTACK_SECRET_KEY is not set in environment variables.");
        return res.status(500).json({ status: "error", message: "Server configuration error" });
      }

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );

      const { status, data } = response.data;

      if (status && data.status === "success") {
        // Transaction is verified
        return res.json({ 
          status: "success", 
          message: "Transaction verified",
          data: {
            amount: data.amount,
            customer: data.customer,
            paid_at: data.paid_at
          }
        });
      } else {
        return res.status(400).json({ 
          status: "error", 
          message: "Transaction verification failed",
          details: data.gateway_response 
        });
      }
    } catch (error: any) {
      console.error("Paystack verification error:", error.response?.data || error.message);
      return res.status(500).json({ 
        status: "error", 
        message: "Internal server error during verification" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
