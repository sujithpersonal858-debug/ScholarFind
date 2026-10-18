const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { getDbStatus } = require('./db');

// Import Mongoose models
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Scholarship = require('../models/Scholarship');
const SavedScholarship = require('../models/SavedScholarship');
const ApplicationTrack = require('../models/ApplicationTrack');

const DATA_FILE = path.join(__dirname, '../../data/scholarfind_db.json');

// Initialize local JSON storage if fallback is used
function readLocalDb() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      profiles: [],
      scholarships: [],
      savedScholarships: [],
      applicationTracks: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], profiles: [], scholarships: [], savedScholarships: [], applicationTracks: [] };
  }
}

function writeLocalDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

/**
 * Universal Repository Layer
 * Seamlessly routes data calls to either MongoDB (Mongoose) or Local Persistent Engine
 */
const repository = {
  // USER OPERATIONS
  users: {
    async findByEmail(email) {
      const { isFallbackMode } = getDbStatus();
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!isFallbackMode) {
        return await User.findOne({ email: cleanEmail }).lean();
      }
      const db = readLocalDb();
      return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
    },

    async findById(id) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await User.findById(id).select('-password').lean();
      }
      const db = readLocalDb();
      const user = db.users.find(u => u._id === id.toString());
      if (!user) return null;
      const { password, ...safeUser } = user;
      return safeUser;
    },

    async create(userData) {
      const { isFallbackMode } = getDbStatus();
      const cleanData = {
        ...userData,
        email: userData.email.trim().toLowerCase(),
        role: userData.role || 'student'
      };
      if (!isFallbackMode) {
        const user = new User(cleanData);
        return await user.save();
      }
      const db = readLocalDb();
      const newUser = {
        _id: generateId(),
        ...cleanData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeLocalDb(db);
      return newUser;
    },

    async count() {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await User.countDocuments();
      }
      return readLocalDb().users.length;
    },

    async countStudents() {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await User.countDocuments({ role: 'student' });
      }
      const db = readLocalDb();
      return db.users.filter(u => u.role === 'student').length;
    },

    async findAllStudents() {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 }).lean();
        const profiles = await StudentProfile.find().lean();
        const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));
        return students.map(s => ({
          ...s,
          profile: profileMap.get(s._id.toString()) || null
        }));
      }
      const db = readLocalDb();
      const students = db.users
        .filter(u => u.role === 'student')
        .map(({ password, ...u }) => ({
          ...u,
          profile: db.profiles.find(p => p.userId === u._id.toString()) || null
        }));
      return students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    async updateStatus(id, updates) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password').lean();
      }
      const db = readLocalDb();
      const idx = db.users.findIndex(u => u._id === id.toString());
      if (idx === -1) return null;
      db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
      writeLocalDb(db);
      const { password, ...safeUser } = db.users[idx];
      return safeUser;
    }
  },

  // PROFILE OPERATIONS
  profiles: {
    async findByUserId(userId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await StudentProfile.findOne({ userId }).lean();
      }
      const db = readLocalDb();
      return db.profiles.find(p => p.userId === userId.toString()) || null;
    },

    async upsert(userId, profileData) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await StudentProfile.findOneAndUpdate(
          { userId },
          { ...profileData, userId },
          { new: true, upsert: true, runValidators: true }
        ).lean();
      }
      const db = readLocalDb();
      const idx = db.profiles.findIndex(p => p.userId === userId.toString());
      if (idx >= 0) {
        db.profiles[idx] = {
          ...db.profiles[idx],
          ...profileData,
          userId: userId.toString(),
          updatedAt: new Date().toISOString()
        };
        writeLocalDb(db);
        return db.profiles[idx];
      } else {
        const newProfile = {
          _id: generateId(),
          userId: userId.toString(),
          ...profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.profiles.push(newProfile);
        writeLocalDb(db);
        return newProfile;
      }
    }
  },

  // SCHOLARSHIP OPERATIONS
  scholarships: {
    async find(filter = {}) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await Scholarship.find(filter).sort({ applicationDeadline: 1 }).lean();
      }
      const db = readLocalDb();
      let list = [...db.scholarships];
      if (filter.status) {
        list = list.filter(s => s.status === filter.status);
      }
      return list.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
    },

    async findById(id) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await Scholarship.findById(id).lean();
      }
      const db = readLocalDb();
      return db.scholarships.find(s => s._id === id.toString()) || null;
    },

    async create(data) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        const item = new Scholarship(data);
        return await item.save();
      }
      const db = readLocalDb();
      const newScholarship = {
        _id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.scholarships.push(newScholarship);
      writeLocalDb(db);
      return newScholarship;
    },

    async update(id, data) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await Scholarship.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      }
      const db = readLocalDb();
      const idx = db.scholarships.findIndex(s => s._id === id.toString());
      if (idx === -1) return null;
      db.scholarships[idx] = {
        ...db.scholarships[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      writeLocalDb(db);
      return db.scholarships[idx];
    },

    async delete(id) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await Scholarship.findByIdAndDelete(id);
      }
      const db = readLocalDb();
      const idx = db.scholarships.findIndex(s => s._id === id.toString());
      if (idx === -1) return false;
      db.scholarships.splice(idx, 1);
      writeLocalDb(db);
      return true;
    },

    async count() {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await Scholarship.countDocuments();
      }
      return readLocalDb().scholarships.length;
    }
  },

  // SAVED SCHOLARSHIPS OPERATIONS
  saved: {
    async find(userId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await SavedScholarship.find({ userId }).populate('scholarshipId').lean();
      }
      const db = readLocalDb();
      const userSaved = db.savedScholarships.filter(s => s.userId === userId.toString());
      return userSaved.map(item => ({
        ...item,
        scholarshipId: db.scholarships.find(sch => sch._id === item.scholarshipId.toString()) || null
      }));
    },

    async countByUser(userId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await SavedScholarship.countDocuments({ userId });
      }
      const db = readLocalDb();
      return db.savedScholarships.filter(s => s.userId === userId.toString()).length;
    },

    async create(userId, scholarshipId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await SavedScholarship.findOneAndUpdate(
          { userId, scholarshipId },
          { userId, scholarshipId },
          { upsert: true, new: true }
        );
      }
      const db = readLocalDb();
      const exists = db.savedScholarships.find(
        s => s.userId === userId.toString() && s.scholarshipId === scholarshipId.toString()
      );
      if (exists) return exists;
      const newSaved = {
        _id: generateId(),
        userId: userId.toString(),
        scholarshipId: scholarshipId.toString(),
        createdAt: new Date().toISOString()
      };
      db.savedScholarships.push(newSaved);
      writeLocalDb(db);
      return newSaved;
    },

    async remove(userId, scholarshipId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await SavedScholarship.findOneAndDelete({ userId, scholarshipId });
      }
      const db = readLocalDb();
      const idx = db.savedScholarships.findIndex(
        s => s.userId === userId.toString() && s.scholarshipId === scholarshipId.toString()
      );
      if (idx >= 0) {
        db.savedScholarships.splice(idx, 1);
        writeLocalDb(db);
        return true;
      }
      return false;
    },

    async isSaved(userId, scholarshipId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        const item = await SavedScholarship.findOne({ userId, scholarshipId });
        return Boolean(item);
      }
      const db = readLocalDb();
      return db.savedScholarships.some(
        s => s.userId === userId.toString() && s.scholarshipId === scholarshipId.toString()
      );
    }
  },

  // APPLICATION TRACKING OPERATIONS
  tracking: {
    async find(userId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await ApplicationTrack.find({ userId }).populate('scholarshipId').lean();
      }
      const db = readLocalDb();
      const userTracks = db.applicationTracks.filter(t => t.userId === userId.toString());
      return userTracks.map(item => ({
        ...item,
        scholarshipId: db.scholarships.find(sch => sch._id === item.scholarshipId.toString()) || null
      }));
    },

    async countByUser(userId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await ApplicationTrack.countDocuments({ userId });
      }
      const db = readLocalDb();
      return db.applicationTracks.filter(t => t.userId === userId.toString()).length;
    },

    async findAllWithDetails() {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await ApplicationTrack.find()
          .populate('userId', '-password')
          .populate('scholarshipId')
          .sort({ updatedAt: -1 })
          .lean();
      }
      const db = readLocalDb();
      return db.applicationTracks.map(t => {
        const user = db.users.find(u => u._id === t.userId.toString());
        const profile = db.profiles.find(p => p.userId === t.userId.toString());
        const safeUser = user ? { _id: user._id, name: user.name, email: user.email, profile } : null;
        const scholarship = db.scholarships.find(s => s._id === t.scholarshipId.toString()) || null;
        return {
          ...t,
          userId: safeUser,
          scholarshipId: scholarship
        };
      }).sort((a, b) => new Date(b.updatedAt || b.appliedDate) - new Date(a.updatedAt || a.appliedDate));
    },

    async updateById(id, updates) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await ApplicationTrack.findByIdAndUpdate(id, updates, { new: true }).populate('userId', '-password').populate('scholarshipId').lean();
      }
      const db = readLocalDb();
      const idx = db.applicationTracks.findIndex(t => t._id === id.toString());
      if (idx === -1) return null;
      db.applicationTracks[idx] = {
        ...db.applicationTracks[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      writeLocalDb(db);
      return db.applicationTracks[idx];
    },

    async upsert(userId, scholarshipId, status, notes = '') {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await ApplicationTrack.findOneAndUpdate(
          { userId, scholarshipId },
          { userId, scholarshipId, status, notes, updatedAt: new Date() },
          { upsert: true, new: true, runValidators: true }
        );
      }
      const db = readLocalDb();
      const idx = db.applicationTracks.findIndex(
        t => t.userId === userId.toString() && t.scholarshipId === scholarshipId.toString()
      );
      if (idx >= 0) {
        db.applicationTracks[idx].status = status;
        db.applicationTracks[idx].notes = notes;
        db.applicationTracks[idx].updatedAt = new Date().toISOString();
        writeLocalDb(db);
        return db.applicationTracks[idx];
      }
      const newTrack = {
        _id: generateId(),
        userId: userId.toString(),
        scholarshipId: scholarshipId.toString(),
        status,
        notes,
        appliedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.applicationTracks.push(newTrack);
      writeLocalDb(db);
      return newTrack;
    },

    async remove(userId, scholarshipId) {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        return await ApplicationTrack.findOneAndDelete({ userId, scholarshipId });
      }
      const db = readLocalDb();
      const idx = db.applicationTracks.findIndex(
        t => t.userId === userId.toString() && t.scholarshipId === scholarshipId.toString()
      );
      if (idx >= 0) {
        db.applicationTracks.splice(idx, 1);
        writeLocalDb(db);
        return true;
      }
      return false;
    }
  },

  // OVERVIEW & ANALYTICS
  stats: {
    async getOverview() {
      const { isFallbackMode } = getDbStatus();
      if (!isFallbackMode) {
        const [totalScholarships, activeScholarships, totalStudents, applications] = await Promise.all([
          Scholarship.countDocuments(),
          Scholarship.countDocuments({ status: 'active' }),
          User.countDocuments({ role: 'student' }),
          ApplicationTrack.find().lean()
        ]);
        const pendingApplications = applications.filter(a => a.status === 'Applied' || a.status === 'Awaiting Result').length;
        const completedApplications = applications.filter(a => a.status === 'Completed').length;
        return {
          totalScholarships,
          activeScholarships,
          expiredScholarships: totalScholarships - activeScholarships,
          totalStudents,
          submittedApplications: applications.length,
          pendingApplications,
          completedApplications
        };
      }
      const db = readLocalDb();
      const totalScholarships = db.scholarships.length;
      const activeScholarships = db.scholarships.filter(s => s.status === 'active').length;
      const totalStudents = db.users.filter(u => u.role === 'student').length;
      const applications = db.applicationTracks;
      const pendingApplications = applications.filter(a => a.status === 'Applied' || a.status === 'Awaiting Result').length;
      const completedApplications = applications.filter(a => a.status === 'Completed').length;
      return {
        totalScholarships,
        activeScholarships,
        expiredScholarships: totalScholarships - activeScholarships,
        totalStudents,
        submittedApplications: applications.length,
        pendingApplications,
        completedApplications
      };
    }
  }
};

module.exports = repository;
