// src/data/tender.js

export const dummyTenders = [
  {
    id: "TND001",
    title: "Construction of Rural Roads",
    description: "Building 15 km of rural roads",
    fullDescription: "This tender involves 15 km of all-weather roads including drainage, culverts, and surfacing works.",
    requirements: {
      minBudget: 5000000,
      maxTimeline: 180, // days
      requiredMaterials: ["Cement", "Bitumen", "Steel"],
      requiredSpecialization: ["Civil", "Construction"]
    },
    // deadline set 5 minutes from now
    deadline: new Date(new Date().getTime() + 5 * 60 * 1000)
  },
  {
    id: "TND002",
    title: "Solar Power Plant Installation",
    description: "Install a 2 MW solar plant",
    fullDescription: "Design, procure, and install 2 MW PV plant including panels, inverters, and grid connection.",
    requirements: {
      minBudget: 20000000,
      maxTimeline: 240, // days
      requiredMaterials: ["Solar Panels", "Inverters", "Batteries"],
      requiredSpecialization: ["Electrical", "Solar"]
    },
    // deadline set 10 minutes from now
    deadline: new Date(new Date().getTime() + 10 * 60 * 1000)
  }
];
