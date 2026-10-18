const repository = require('../config/repository');

/**
 * Get all scholarships saved by the authenticated student
 */
const getSavedScholarships = async (req, res) => {
  try {
    const saved = await repository.saved.find(req.user.id);
    return res.json({
      success: true,
      count: saved.length,
      saved
    });
  } catch (error) {
    console.error('Get saved error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving saved scholarships.'
    });
  }
};

/**
 * Save a scholarship to student's favourites
 */
const saveScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship ID is required.'
      });
    }

    const item = await repository.scholarships.findById(scholarshipId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.'
      });
    }

    const saved = await repository.saved.create(req.user.id, scholarshipId);
    return res.status(201).json({
      success: true,
      message: 'Scholarship saved to your favourites.',
      saved
    });
  } catch (error) {
    console.error('Save scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving scholarship.'
    });
  }
};

/**
 * Remove a scholarship from student's favourites
 */
const removeSavedScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const removed = await repository.saved.remove(req.user.id, scholarshipId);

    return res.json({
      success: true,
      message: removed ? 'Scholarship removed from favourites.' : 'Scholarship was not in favourites.'
    });
  } catch (error) {
    console.error('Remove saved error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing saved scholarship.'
    });
  }
};

/**
 * Get student's application tracking records
 */
const getTrackingList = async (req, res) => {
  try {
    const tracks = await repository.tracking.find(req.user.id);
    return res.json({
      success: true,
      count: tracks.length,
      tracks,
      disclaimer: 'Application statuses are self-reported and maintained by the student. ScholarFind does not connect directly to official government or private scholarship submission portals.'
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving application tracking records.'
    });
  }
};

/**
 * Update or record application status for a scholarship
 */
const updateTrackingStatus = async (req, res) => {
  try {
    const { scholarshipId, status, notes } = req.body;

    const validStatuses = ['Not Applied', 'Applied', 'Awaiting Result', 'Completed'];
    if (!scholarshipId || !status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status (${validStatuses.join(', ')}) and scholarshipId are required.`
      });
    }

    const item = await repository.scholarships.findById(scholarshipId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.'
      });
    }

    const track = await repository.tracking.upsert(req.user.id, scholarshipId, status, notes || '');

    return res.json({
      success: true,
      message: 'Application status updated.',
      track
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating application status.'
    });
  }
};

/**
 * Get student dashboard summary stats (Available, Saved, Submitted, Deadlines)
 */
const getStudentSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const [allScholarships, saved, tracks] = await Promise.all([
      repository.scholarships.find({ status: 'active' }),
      repository.saved.find(userId),
      repository.tracking.find(userId)
    ]);

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = allScholarships.filter(s => {
      const d = new Date(s.applicationDeadline);
      return d >= now && d <= thirtyDaysLater;
    }).length;

    const submittedCount = tracks.filter(t => t.status !== 'Not Applied').length;

    return res.json({
      success: true,
      summary: {
        availableScholarships: allScholarships.length,
        savedScholarships: saved.length,
        submittedApplications: submittedCount,
        upcomingDeadlines: upcomingDeadlines
      }
    });
  } catch (error) {
    console.error('Get student summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving summary statistics.'
    });
  }
};

module.exports = {
  getSavedScholarships,
  saveScholarship,
  removeSavedScholarship,
  getTrackingList,
  updateTrackingStatus,
  getStudentSummary
};
