import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// GET all resources
router.get("/", async (req, res) => {
  try {
    // First verify the table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
      )
    `);

    if (!tableExists.rows[0].exists) {
      return res.status(500).json({
        error: "Resources table not found",
        solution: "Run the schema.sql file to create tables"
      });
    }

    // Now query the resources
    const { rows } = await pool.query(`
      SELECT 
        id, name, type, provider, specs,
        cpu_utilization, memory_utilization,
        storage_used, monthly_cost,
        is_implemented, created_at, updated_at
      FROM resources
      ORDER BY created_at DESC
    `);

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error('Error in GET /resources:', error);
    res.status(500).json({
      error: "Failed to fetch resources",
      details: error.message,
      solution: "Check database connection and table structure"
    });
  }
});

// POST - Create new resource
router.post("/", async (req, res) => {
  const {
    name,
    type,
    provider,
    specs,
    cpu_utilization,
    memory_utilization,
    storage_used,
    monthly_cost
  } = req.body;

  // Basic validation
  if (!name || !type || !provider) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "type", "provider"],
      received: req.body
    });
  }

  try {
    // Verify table exists first
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
      )
    `);

    if (!tableExists.rows[0].exists) {
      return res.status(500).json({
        error: "Resources table not found",
        solution: "Run the schema.sql file to create tables"
      });
    }

    const query = `
      INSERT INTO resources (
        name, type, provider, specs,
        cpu_utilization, memory_utilization,
        storage_used, monthly_cost
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      name,
      type,
      provider,
      specs,
      cpu_utilization || null,
      memory_utilization || null,
      storage_used || null,
      monthly_cost || null
    ];

    const { rows } = await pool.query(query, values);
    
    res.status(201).json({
      message: "Resource created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    
    if (error.code === '23502') { // Not null violation
      res.status(400).json({
        error: "Validation error",
        details: error.message,
        required: ["name", "type", "provider"]
      });
    } else if (error.code === '23514') { // Check constraint violation
      res.status(400).json({
        error: "Invalid data",
        details: error.message,
        valid_types: ["instance", "storage"]
      });
    } else {
      res.status(500).json({
        error: "Failed to create resource",
        details: error.message
      });
    }
  }
});

export default router;