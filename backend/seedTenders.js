// seedTenders.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Tender from "./models/Tender.js";

dotenv.config();

const seedTenders = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_CONN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");

    // Clear old tenders
    await Tender.deleteMany({});
    console.log("Old tenders cleared.");

    const now = new Date();

    // Insert new tenders with short deadlines
    await Tender.insertMany([
      {
        title: "Road Construction",
        fullDescription: "Build a highway from A to B",
        deadline: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
        requirements: {
          minBudget: 1000000,
          maxTimeline: 180,
          requiredMaterials: ["Cement", "Steel", "Asphalt"],
          requiredSpecialization: ["Civil Engineering"],
        },
      },
      {
        title: "Bridge Renovation",
        fullDescription: "Repair the old bridge at XYZ location",
        deadline: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes from now
        requirements: {
          minBudget: 500000,
          maxTimeline: 120,
          requiredMaterials: ["Steel", "Concrete"],
          requiredSpecialization: ["Civil Engineering", "Structural Engineering"],
        },
      },
    ]);

    console.log("Tenders seeded!");
    process.exit(); // exit after seeding
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

// Call the function
seedTenders();
