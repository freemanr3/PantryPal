import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || 'https://mealmatcher.amplifyapp.com'
    : 'http://localhost:5179',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Routes
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE id = ${req.params.id}
    `;
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/users/:id/budget', async (req, res, next) => {
  try {
    const { budget } = req.body;
    const { rows } = await sql`
      UPDATE users 
      SET budget = ${budget}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/users/:id/ingredients', async (req, res, next) => {
  try {
    const { ingredients } = req.body;
    const { rows } = await sql`
      UPDATE users 
      SET ingredients = ${ingredients}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/users/:id/preferences', async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const { rows } = await sql`
      UPDATE users 
      SET dietary_preferences = ${preferences}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
