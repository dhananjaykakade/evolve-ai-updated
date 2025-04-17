import express from 'express';
import Log from '../models/logs.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET all logs for a test
router.get('/:testId', async (req, res) => {
  const { testId } = req.params;
  const logs = await Log.find({ testId }).sort({ timestamp: -1 });
  res.json({ success: true, logs });
});

router.get('/tests/:id/logs', async (req, res) => {
    try {
      const testId = req.params.id;
      
      // Validate that the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid test ID format'
        });
      }
      
      // Get all logs for this test, sorted by timestamp
      const logs = await Log.find({ 
        testId: new mongoose.Types.ObjectId(testId) 
      })
      .sort({ timestamp: 1 })
      .limit(1000); // Limit to 1000 most recent logs for performance
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch logs',
        error: error.message
      });
    }
  });

  
  router.get('/tests/:id/stats', async (req, res) => {
    try {
      const testId = req.params.id;
      
      // Validate that the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid test ID format'
        });
      }
      
      // Get count of logs
      const totalLogs = await Log.countDocuments({ 
        testId: new mongoose.Types.ObjectId(testId) 
      });
      
      // Get count of unique students
      const uniqueStudentsAgg = await Log.aggregate([
        { $match: { testId: new mongoose.Types.ObjectId(testId) } },
        { $group: { _id: "$studentId" } },
        { $count: "uniqueStudents" }
      ]);
      
      const uniqueStudents = uniqueStudentsAgg.length > 0 ? 
        uniqueStudentsAgg[0].uniqueStudents : 0;
      
      // Get count of warnings
      const warningsCount = await Log.countDocuments({
        testId: new mongoose.Types.ObjectId(testId),
        message: { 
          $regex: /(warning|suspicious|error)/i 
        }
      });
      
      res.json({
        success: true,
        data: {
          totalLogs,
          uniqueStudents,
          warningsCount
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stats',
        error: error.message
      });
    }
  });


  router.get('/tests/:id/students', async (req, res) => {
    try {
      const testId = req.params.id;
      
      // Validate that the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid test ID format'
        });
      }
      
      // Get unique students from logs
      const students = await Log.aggregate([
        { $match: { testId: new mongoose.Types.ObjectId(testId) } },
        { $group: { 
          _id: "$studentId",
          name: { $first: "$studentName" },
          lastActivity: { $max: "$timestamp" }
        }},
        { $sort: { name: 1 } }
      ]);
      
      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students',
        error: error.message
      });
    }
  });

export default router;
