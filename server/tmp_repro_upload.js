const request = require('supertest');
const express = require('express');
const path = require('path');
const upload = require('./middleware/upload');
const app = express();
app.post('/test/upload', upload.uploadResume, (req,res)=>{ console.log('REQ.FILE INSIDE ROUTE', req.file); res.json({success:true, filename:req.file&&req.file.filename});});
app.use((err,req,res,next)=>{ console.error('ERR HANDLER', err && err.message); res.status(400).json({success:false, message: err && err.message}); });
(async()=>{
  const res = await request(app).post('/test/upload').attach('file', path.join('tests','fixtures','resume.pdf')).set('Content-Type','multipart/form-data');
  console.log('STATUS', res.status);
  console.log('BODY', res.body);
})();
