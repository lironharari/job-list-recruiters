import express from 'express';
import Job from '../models/Job';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import elasticClient from '../config/elasticsearch';

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

// Get jobs with optional pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, parseInt((req.query.limit as string) || '10', 10));
    const title = (req.query.title as string) || '';
    const location = (req.query.location as string) || '';
    const level = (req.query.level as string) || '';
    const type = (req.query.type as string) || '';

    // const filter: any = {};
    // if (title) {
    //   filter.title = new RegExp(title, 'i');
    //   // const re = new RegExp(title, 'i');
    //   // filter.$or = [
    //   //   { title: re },
    //   //   // { description: re },
    //   //   { company: re }
    //   // ];
    // }
    // if (location) {
    //   filter.location = new RegExp(location, 'i');
    // }
    // if (level) {
    //   filter.level = new RegExp(level, 'i');
    // }
    // if (type) {
    //   filter.type = new RegExp(type, 'i');
    // }

    // const total = await Job.countDocuments(filter);
    // const jobs = await Job.find(filter)
    //   .sort({ createdAt: -1 })
    //   .skip((page - 1) * limit)
    //   .limit(limit);
    
    // Elasticsearch version
    const esQuery: any = {
      bool: { must: [] as any[] }
    };
    if (title) {
      esQuery.bool.must.push({ match_phrase: { title } });
    }
    if (location) {
      esQuery.bool.must.push({ match_phrase: { location } });
    }
    if (level) {
      esQuery.bool.must.push({ match_phrase: { level } });
    }
    if (type) {
      esQuery.bool.must.push({ match_phrase: { type } });
    }

    const esResult = await elasticClient.search({
      index: 'jobs',
      from: (page - 1) * limit,
      size: limit,
      query: esQuery.bool.must.length ? esQuery : { match_all: {} },
      sort: [{ createdAt: { order: 'desc' } }],
    });
  
    const jobsElastic = esResult.hits.hits.map((hit: any) => {      
      return new Job({
        _id: hit._id,
        title: hit._source.title,
        description: hit._source.description,
        company: hit._source.company,
        location: hit._source.location,        
        level: hit._source.level,
        type: hit._source.type,
        salary: hit._source.salary,
        createdAt: hit._source.createdAt,
        updatedAt: hit._source.updatedAt,
      });
    });
    if (!jobsElastic || jobsElastic.length === 0) {
      return res.status(404).json({ message: 'Jobs not found in ElasticSearch' });
    }
    const totalElastic = esResult.hits.total && typeof esResult.hits.total === 'object' ? esResult.hits.total.value : esResult.hits.total;    
    res.json({ jobs: jobsElastic, total: totalElastic });    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PROTECTED ROUTES
 */

// Create a new job (Recruiter / Admin)
router.post('/', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const { title, description, company, location, salary, level, type } = req.body;

    const newJob = new Job({
      title,
      description,
      company,
      location,
      salary,
      level,
      type,
    });

    const savedJob = await newJob.save();
    if (!savedJob) {
      return res.status(404).json({ message: 'Job not created' });
    }
    const esResult = await elasticClient.index({
        index: 'jobs',
        id: savedJob._id.toString(),
        document: {
          title: savedJob.title,
          description: savedJob.description,
          company: savedJob.company,
          location: savedJob.location,
          salary: savedJob.salary,
          level: savedJob.level,
          type: savedJob.type,
          createdAt: savedJob.createdAt,
        },
      });
    if (!esResult.result || esResult.result !== 'created') {
      return res.status(404).json({ message: 'Job not created' });
    }
    res.status(201).json(savedJob);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update a job by ID (Recruiter / Admin)
router.put('/:id', authenticate, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update in ElasticSearch
    const esResult = await elasticClient.index({
        index: 'jobs',
        id: updatedJob._id.toString(),
        document: {
          title: updatedJob.title,
          description: updatedJob.description,
          company: updatedJob.company,
          location: updatedJob.location,
          salary: updatedJob.salary,
          level: updatedJob.level,
          type: updatedJob.type,
          createdAt: updatedJob.createdAt,
        },
      });
    if (!esResult.result || esResult.result !== 'updated') {
      return res.status(404).json({ message: 'Job not updated in ElasticSearch' });
    }    
    res.json(updatedJob);
  } catch (err){
    console.error(err);
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete a job by ID (Recruiter / Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {    
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    // Remove from ElasticSearch
    const esResult = await elasticClient.delete({
        index: 'jobs',
        id: deletedJob._id.toString(),
      });    
    if (!esResult.result || esResult.result !== 'deleted') {
      return res.status(404).json({ message: 'Job not deleted in ElasticSearch' });
    }
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
