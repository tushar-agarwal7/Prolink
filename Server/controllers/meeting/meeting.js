// Server/controllers/meeting/meeting.js
const MeetingHistory = require('../../model/schema/meeting');
const { Contact } = require('../../model/schema/contact');
const { Lead } = require('../../model/schema/lead');
const User = require('../../model/schema/user');
const mongoose = require('mongoose');

const add = async (req, res) => {
    try {
        console.log('Creating meeting with data:', req.body);
        
        // Add timestamp
        req.body.timestamp = new Date();
        
        const meeting = new MeetingHistory(req.body);
        await meeting.save();
        
        console.log('Meeting created successfully:', meeting._id);
        res.status(200).json({ message: 'Meeting created successfully', meeting });
    } catch (err) {
        console.error('Failed to create Meeting:', err);
        res.status(400).json({ error: 'Failed to create Meeting', details: err.message });
    }
}

const index = async (req, res) => {
    try {
        console.log('Fetching meetings with query:', req.query);
        
        const query = { ...req.query, deleted: false };
        
        // First fetch meetings without populate to avoid schema issues
        let allMeetings = await MeetingHistory.find(query)
            .sort({ timestamp: -1 })
            .lean();

        console.log(`Found ${allMeetings.length} meetings`);

        // Manually populate createBy data
        const populatedMeetings = [];
        for (const meeting of allMeetings) {
            let createdByName = 'Unknown User';
            
            if (meeting.createBy) {
                try {
                    const user = await User.findById(meeting.createBy).select('firstName lastName username').lean();
                    if (user) {
                        createdByName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
                    }
                } catch (err) {
                    console.log('Error fetching user:', err.message);
                }
            }

            populatedMeetings.push({
                ...meeting,
                createdByName
            });
        }

        res.status(200).json(populatedMeetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
}

const view = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({ _id: req.params.id, deleted: false }).lean();

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        // Manually populate related data to avoid schema issues
        let populatedMeeting = { ...meeting };

        // Populate createBy
        if (meeting.createBy) {
            try {
                const user = await User.findById(meeting.createBy).select('firstName lastName username').lean();
                populatedMeeting.createBy = user;
            } catch (err) {
                console.log('Error fetching user:', err.message);
            }
        }

        // Populate attendes (contacts) - only if Contact model exists
        if (meeting.attendes && meeting.attendes.length > 0) {
            try {
                const contacts = await Contact.find({ _id: { $in: meeting.attendes } })
                    .select('firstName lastName email title').lean();
                populatedMeeting.attendes = contacts;
            } catch (err) {
                console.log('Error fetching contacts:', err.message);
                populatedMeeting.attendes = [];
            }
        }

        // Populate attendesLead - only if Lead model exists
        if (meeting.attendesLead && meeting.attendesLead.length > 0) {
            try {
                const leads = await Lead.find({ _id: { $in: meeting.attendesLead } })
                    .select('leadName leadEmail').lean();
                populatedMeeting.attendesLead = leads;
            } catch (err) {
                console.log('Error fetching leads:', err.message);
                populatedMeeting.attendesLead = [];
            }
        }

        res.status(200).json(populatedMeeting);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting', details: error.message });
    }
}

const edit = async (req, res) => {
    try {
        const result = await MeetingHistory.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({ message: 'Meeting updated successfully', result });
    } catch (err) {
        console.error('Failed to Update Meeting:', err);
        res.status(400).json({ error: 'Failed to Update Meeting', details: err.message });
    }
}

const deleteData = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findByIdAndUpdate(
            req.params.id, 
            { deleted: true }, 
            { new: true }
        );
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({ message: 'Meeting deleted successfully', meeting });
    } catch (err) {
        console.error('Error deleting meeting:', err);
        res.status(500).json({ error: 'Failed to delete meeting', details: err.message });
    }
}

const deleteMany = async (req, res) => {
    try {
        const meetingIds = req.body;
        
        if (!Array.isArray(meetingIds) || meetingIds.length === 0) {
            return res.status(400).json({ message: 'Please provide valid meeting IDs' });
        }

        const result = await MeetingHistory.updateMany(
            { _id: { $in: meetingIds } }, 
            { $set: { deleted: true } }
        );

        res.status(200).json({ 
            message: `${result.modifiedCount} meetings deleted successfully`, 
            result 
        });
    } catch (err) {
        console.error('Error deleting meetings:', err);
        res.status(500).json({ error: 'Failed to delete meetings', details: err.message });
    }
}

module.exports = { add, index, view, edit, deleteData, deleteMany }