/**
 * Seed script — creates a demo user and 10 sample candidates.
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 * Or:  node -r ts-node/register scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load .env.local if present
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(path.join(__dirname, '../.env.local'));
  } else {
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...vals] = trimmed.split('=');
          if (key && vals.length > 0) {
            process.env[key.trim()] = vals.join('=').trim();
          }
        }
      }
    }
  }
} catch (e) {
  // Ignore env loading errors
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI is not set');

const UserSchema = new mongoose.Schema({ name: String, email: String, passwordHash: String });
const CandidateSchema = new mongoose.Schema({
  fullName: String, email: String, phone: String,
  appliedRole: String, skills: [String], experience: String,
  hiringStage: String, resumeUrl: String, notes: String,
  createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

const DEMO_CANDIDATES = [
  { fullName: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101', appliedRole: 'Senior React Developer', skills: ['React', 'TypeScript', 'Node.js'], experience: '5 years', hiringStage: 'Interview' },
  { fullName: 'Bob Martinez', email: 'bob@example.com', phone: '+1-555-0102', appliedRole: 'Product Manager', skills: ['Agile', 'Roadmap', 'Analytics'], experience: '7 years', hiringStage: 'Screening' },
  { fullName: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-0103', appliedRole: 'UX Designer', skills: ['Figma', 'User Research', 'Prototyping'], experience: '4 years', hiringStage: 'Offer' },
  { fullName: 'David Kim', email: 'david@example.com', phone: '+1-555-0104', appliedRole: 'Backend Engineer', skills: ['Python', 'FastAPI', 'PostgreSQL'], experience: '3 years', hiringStage: 'Applied' },
  { fullName: 'Emily Chen', email: 'emily@example.com', phone: '+1-555-0105', appliedRole: 'Data Scientist', skills: ['Python', 'ML', 'TensorFlow'], experience: '6 years', hiringStage: 'Hired' },
  { fullName: 'Frank Davis', email: 'frank@example.com', phone: '+1-555-0106', appliedRole: 'DevOps Engineer', skills: ['AWS', 'Kubernetes', 'Terraform'], experience: '4 years', hiringStage: 'Interview' },
  { fullName: 'Grace Lee', email: 'grace@example.com', phone: '+1-555-0107', appliedRole: 'Frontend Developer', skills: ['Vue.js', 'CSS', 'Webpack'], experience: '2 years', hiringStage: 'Applied' },
  { fullName: 'Henry Thompson', email: 'henry@example.com', phone: '+1-555-0108', appliedRole: 'Sales Manager', skills: ['CRM', 'B2B Sales', 'Negotiation'], experience: '8 years', hiringStage: 'Rejected' },
  { fullName: 'Isabella Brown', email: 'isabella@example.com', phone: '+1-555-0109', appliedRole: 'Marketing Specialist', skills: ['SEO', 'Content', 'Analytics'], experience: '3 years', hiringStage: 'Screening' },
  { fullName: 'James Wilson', email: 'james@example.com', phone: '+1-555-0110', appliedRole: 'Full Stack Developer', skills: ['React', 'Node.js', 'MongoDB'], experience: '5 years', hiringStage: 'Offer' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected to MongoDB');

  // Create demo user
  let user = await User.findOne({ email: 'demo@earljobs.ai' });
  if (!user) {
    const passwordHash = await bcrypt.hash('demo123456', 12);
    user = await User.create({ name: 'Demo Recruiter', email: 'demo@earljobs.ai', passwordHash });
    console.log('Created demo user: demo@earljobs.ai / demo123456');
  } else {
    console.log('Demo user already exists');
  }

  // Create candidates
  const existing = await Candidate.countDocuments({ createdBy: user._id });
  if (existing === 0) {
    const candidates = DEMO_CANDIDATES.map((c) => ({ ...c, createdBy: user._id }));
    await Candidate.insertMany(candidates);
    console.log(`Seeded ${candidates.length} demo candidates`);
  } else {
    console.log(`Skipping candidates — ${existing} already exist`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
