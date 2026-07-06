const mongoose = require('mongoose');

async function checkAndRepair() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/HireAi');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check applications
    console.log('\n=== Current Applications ===');
    const apps = await db.collection('applications').find().toArray();
    console.log(`Total applications: ${apps.length}`);
    apps.forEach(app => {
      console.log(`  Candidate: ${app.candidate}, Job: ${app.job}`);
    });
    
    // Check indexes
    console.log('\n=== Current Indexes ===');
    const indexes = await db.collection('applications').listIndexes().toArray();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Drop all non-default indexes
    console.log('\n=== Dropping indexes ===');
    for (const idx of indexes) {
      if (idx.name !== '_id_') {
        try {
          await db.collection('applications').dropIndex(idx.name);
          console.log(`✅ Dropped index: ${idx.name}`);
        } catch(e) {
          console.log(`⚠️ Could not drop ${idx.name}: ${e.message}`);
        }
      }
    }
    
    // Recreate the correct unique index
    console.log('\n=== Creating correct index ===');
    await db.collection('applications').createIndex({ candidate: 1, job: 1 }, { unique: true });
    console.log('✅ Created unique index on (candidate, job)');
    
    process.exit(0);
  } catch(err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAndRepair();
