// Server/controllers/meeting/_routes.js
const express = require('express');
const meeting = require('./meeting');
const auth = require('../../middelwares/auth');
const router = express.Router();

// GET all meetings
router.get('/', auth, meeting.index);

// POST create new meeting
router.post('/add', auth, meeting.add);

// GET single meeting by ID
router.get('/view/:id', auth, meeting.view);

// PUT update meeting by ID
router.put('/edit/:id', auth, meeting.edit);

// DELETE single meeting by ID
router.delete('/delete/:id', auth, meeting.deleteData);

// POST delete multiple meetings
router.post('/deleteMany', auth, meeting.deleteMany);

module.exports = router;