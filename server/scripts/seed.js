/**
 * Seed script — populates the database with enough demo data that the
 * app is immediately useful after `npm run seed`, without requiring
 * anyone to manually register and wait for company approval first.
 *
 * Run from the server/ folder: npm run seed
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const JOBS = [
  {
    title: 'Senior Frontend Engineer',
    description:
      'We are looking for a Senior Frontend Engineer to lead the development of our customer-facing dashboard. You will own component architecture, mentor junior engineers, and work closely with design to ship polished, accessible UI. Strong experience with React and modern state management is essential.',
    skillsRequired: ['react', 'javascript', 'typescript', 'redux', 'tailwindcss', 'css3'],
    salaryMin: 90000,
    salaryMax: 130000,
    experience: '5-10 years',
    location: 'Remote',
    jobType: 'full-time',
    category: 'Engineering',
  },
  {
    title: 'Backend Engineer (Node.js)',
    description:
      'Join our platform team building scalable REST APIs used by millions of requests per day. You will design data models, optimize database queries, and harden services for production. Experience with Node.js, Express, and MongoDB is required.',
    skillsRequired: ['node.js', 'express', 'mongodb', 'rest api', 'docker', 'aws'],
    salaryMin: 80000,
    salaryMax: 120000,
    experience: '2-5 years',
    location: 'Kathmandu, Nepal',
    jobType: 'full-time',
    category: 'Engineering',
  },
  {
    title: 'Product Designer',
    description:
      'We need a product designer who can take a rough idea and turn it into a delightful, usable interface. You will run user research, build prototypes in Figma, and collaborate daily with engineering on implementation details.',
    skillsRequired: ['figma', 'ui design', 'ux design', 'prototyping', 'wireframing', 'user research'],
    salaryMin: 60000,
    salaryMax: 95000,
    experience: '2-5 years',
    location: 'Remote',
    jobType: 'full-time',
    category: 'Design',
  },
  {
    title: 'Data Analyst Intern',
    description:
      'Great opportunity for a student or recent graduate to get hands-on experience with real data pipelines. You will help clean datasets, build dashboards, and present findings to stakeholders. Some experience with Python or SQL is a plus.',
    skillsRequired: ['python', 'sql', 'excel', 'data analysis', 'tableau'],
    salaryMin: 15000,
    salaryMax: 25000,
    experience: 'Fresher',
    location: 'Kathmandu, Nepal',
    jobType: 'internship',
    category: 'Other',
  },
  {
    title: 'DevOps Engineer',
    description:
      'Help us scale our infrastructure as we grow. You will manage Kubernetes clusters, build CI/CD pipelines, and improve our monitoring/alerting stack. Comfortable working independently in a fast-moving environment.',
    skillsRequired: ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd', 'linux'],
    salaryMin: 95000,
    salaryMax: 140000,
    experience: '5-10 years',
    location: 'Remote',
    jobType: 'full-time',
    category: 'Engineering',
  },
  {
    title: 'Digital Marketing Associate',
    description:
      'Drive growth across paid and organic channels. You will run campaigns, analyze performance with Google Analytics, and collaborate with content creators to grow our audience.',
    skillsRequired: ['seo', 'google analytics', 'digital marketing', 'content marketing', 'social media marketing'],
    salaryMin: 35000,
    salaryMax: 55000,
    experience: '1-2 years',
    location: 'Pokhara, Nepal',
    jobType: 'full-time',
    category: 'Marketing',
  },
];

async function seed() {
  await connectDB();
  console.log('🌱 Seeding HireAI demo data...\n');

  // ── Admin ──────────────────────────────────────────────
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: 'admin@hireai.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Admin created          → admin@hireai.com / Admin@123');
  } else {
    console.log('↪️  Admin already exists  → ' + admin.email);
  }

  // ── Demo HR + pre-approved Company ──────────────────────
  let hrUser = await User.findOne({ email: 'hr@hireai.com' });
  let company;
  if (!hrUser) {
    hrUser = await User.create({
      name: 'Sarah Mitchell',
      email: 'hr@hireai.com',
      password: 'Hr@12345',
      role: 'hr',
    });
    company = await Company.create({
      user: hrUser._id,
      companyName: 'Nimbus Technologies',
      description:
        'Nimbus Technologies builds developer tools used by thousands of engineering teams worldwide. We are a remote-first company that values craftsmanship, ownership, and clear communication.',
      website: 'https://example.com',
      industry: 'Technology',
      size: '51-200',
      location: 'Remote',
      isApproved: true, // pre-approved so jobs can be posted immediately
    });
    console.log('✅ Demo HR created        → hr@hireai.com / Hr@12345 (company pre-approved)');
  } else {
    company = await Company.findOne({ user: hrUser._id });
    console.log('↪️  Demo HR already exists → ' + hrUser.email);
  }

  // ── Demo Candidate ───────────────────────────────────────
  let candidateUser = await User.findOne({ email: 'candidate@hireai.com' });
  if (!candidateUser) {
    candidateUser = await User.create({
      name: 'Alex Johnson',
      email: 'candidate@hireai.com',
      password: 'Candidate@123',
      role: 'candidate',
      phone: '+1 555 0100',
    });
    await Candidate.create({
      user: candidateUser._id,
      headline: 'Frontend Developer',
      bio: 'Frontend developer with 3 years of experience building React applications. Passionate about clean UI and accessibility.',
      skills: ['react', 'javascript', 'css3', 'html5', 'redux', 'git'],
      location: 'Kathmandu, Nepal',
      github: 'https://github.com/example',
      linkedin: 'https://linkedin.com/in/example',
      education: [
        { institution: 'Tribhuvan University', degree: 'Bachelors', field: 'Computer Science', startYear: 2018, endYear: 2022 },
      ],
      experience: [
        { company: 'WebWorks Inc.', position: 'Junior Frontend Developer', startDate: new Date('2022-06-01'), current: true },
      ],
    });
    console.log('✅ Demo Candidate created → candidate@hireai.com / Candidate@123');
  } else {
    console.log('↪️  Demo Candidate exists  → ' + candidateUser.email);
  }

  // ── Jobs (only seed if none exist yet for this company) ──
  const existingJobCount = await Job.countDocuments({ company: company._id });
  if (existingJobCount === 0) {
    const createdJobs = await Job.insertMany(
      JOBS.map((j) => ({ ...j, company: company._id, postedBy: hrUser._id }))
    );
    console.log(`✅ ${createdJobs.length} demo jobs created for ${company.companyName}`);

    // Give the demo candidate one sample application so dashboards aren't empty
    const firstJob = createdJobs[0];
    await Job.findByIdAndUpdate(firstJob._id, { $inc: { applicantCount: 1 } });
    await Application.create({
      candidate: candidateUser._id,
      job: firstJob._id,
      status: 'shortlisted',
      matchScore: 83,
      matchedSkills: ['react', 'javascript', 'redux'],
      missingSkills: ['typescript', 'tailwindcss'],
      coverLetter: "I'd love the opportunity to bring my React experience to your team.",
      statusHistory: [
        { status: 'applied', changedBy: candidateUser._id },
        { status: 'shortlisted', changedBy: hrUser._id },
      ],
    });
    console.log('✅ Sample application created (Alex Johnson → Senior Frontend Engineer, shortlisted)');
  } else {
    console.log(`↪️  Jobs already exist for ${company.companyName}, skipping job seed`);
  }

  console.log('\n🎉 Seed complete! You can now log in with any of the accounts above.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
