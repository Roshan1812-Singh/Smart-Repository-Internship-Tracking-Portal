const mongoose = require("mongoose");

const mentorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    designation: {
      type: String,
    },
    organization: {
      type: String,
    },
    department: {
      type: String,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number, 
      required: true,
    },
    linkedin: {
      type: String,
    },
    availability: {
      type: String,
      enum: ["full-time", "part-time", "weekends"],
      default: "part-time",
    },
    documents: [{
      name: {
        type: String,
      },
      url: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    resources: [{
      name: {
        type: String,
      },
      type: {
        type: String,
        enum: ['Docs', 'Video', 'Repo', 'PDF', 'Guide']
      },
      url: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    availabilitySchedule: [{
      day: {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      slots: [{
        start: {
          type: String
        },
        end: {
          type: String
        },
        booked: {
          type: Boolean,
          default: false
        }
      }]
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorProfile", mentorProfileSchema);