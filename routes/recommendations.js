import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Verify resources table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resources'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(500).json({
        error: "Resources table not found",
        solution: "Run the schema.sql file to create tables"
      });
    }

    // Get non-implemented resources
    const { rows: resources } = await pool.query(`
      SELECT * FROM resources 
      WHERE is_implemented = false
    `);

    // Generate recommendations
    const recommendations = resources.map(resource => {
      if (resource.type === 'instance' && 
          resource.cpu_utilization < 30 && 
          resource.memory_utilization < 50) {
        return {
          id: resource.id,
          name: resource.name,
          type: resource.type,
          provider: resource.provider,
          recommendation: "Downsize instance to reduce cost by 40–60%",
          confidence: "high",
          current_cpu: resource.cpu_utilization,
          current_memory: resource.memory_utilization,
          monthly_cost: resource.monthly_cost
        };
      }
      else if (resource.type === 'storage' && 
               resource.storage_used > 500) {
        return {
          id: resource.id,
          name: resource.name,
          type: resource.type,
          provider: resource.provider,
          recommendation: "Resize storage to save 20–40%",
          confidence: "low",
          current_storage: resource.storage_used,
          monthly_cost: resource.monthly_cost
        };
      }
      return null;
    }).filter(Boolean);

    res.status(200).json({ data: recommendations });
  } catch (error) {
    console.error('Error in GET /recommendations:', error);
    res.status(500).json({
      error: "Failed to generate recommendations",
      details: error.message,
      solution: "Check database connection and table data"
    });
  }
});

router.post("/:id/implement", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if resource exists
    const resourceCheck = await pool.query(
      'SELECT id FROM resources WHERE id = $1',
      [id]
    );

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: "Resource not found",
        solution: "Provide a valid resource ID"
      });
    }

    // Update resource
    const updateResource = await pool.query(
      `UPDATE resources 
       SET is_implemented = true, 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, name`,
      [id]
    );

    // Update recommendations table if exists
    try {
      const recCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'recommendations'
        )
      `);

      if (recCheck.rows[0].exists) {
        await pool.query(
          `UPDATE recommendations 
           SET status = 'implemented', 
               updated_at = NOW() 
           WHERE resource_id = $1`,
          [id]
        );
      }
    } catch (recError) {
      console.warn('Could not update recommendations table:', recError.message);
    }

    res.status(200).json({
      message: "Recommendation implemented successfully",
      resource: updateResource.rows[0]
    });
  } catch (error) {
    console.error('Error in POST /recommendations/:id/implement:', error);
    res.status(500).json({
      error: "Failed to implement recommendation",
      details: error.message,
      solution: "Verify the resource exists and database is accessible"
    });
  }
});

export default router;