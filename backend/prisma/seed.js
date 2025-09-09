const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tenderhub.com',
      password: hashedPassword,
      role: 'ADMIN',
      companies: {
        create: {
          companyName: 'TenderHub Admin',
          description: 'Platform administration company',
          capabilities: ['Administration', 'Support'],
          certifications: ['Platform Certified'],
          countries: ['Global'],
          experienceYears: 5,
          completedProjects: 1000,
          successRate: 100.0
        }
      }
    },
    include: {
      companies: true
    }
  });

  // Create sample bidder
  const bidderPassword = await bcrypt.hash('bidder123', 12);
  
  const bidderUser = await prisma.user.create({
    data: {
      email: 'bidder@example.com',
      password: bidderPassword,
      role: 'BIDDER',
      companies: {
        create: {
          companyName: 'TechBuild Solutions',
          description: 'Leading construction and technology company',
          website: 'https://techbuild.example.com',
          capabilities: ['Construction', 'Technology', 'Engineering'],
          certifications: ['ISO 9001', 'SOC 2', 'OSHA Certified'],
          countries: ['USA', 'UK', 'Canada'],
          experienceYears: 15,
          completedProjects: 127,
          successRate: 94.5
        }
      }
    },
    include: {
      companies: true
    }
  });

  // Create sample tenders
  const sampleTenders = [
    {
      title: 'Highway Construction Project - Phase 1',
      description: 'Construction of 50km highway with modern infrastructure and safety systems including toll booths, lighting, and emergency lanes.',
      country: 'USA',
      budget: 5000000,
      currency: 'USD',
      deadline: new Date('2025-03-15'),
      category: 'Construction',
      requirements: ['Civil Engineering', 'Road Construction', 'Safety Systems'],
      sourceUrl: 'https://sam.gov/example-tender-1',
      sourceApi: 'sam_gov',
      status: 'OPEN'
    },
    {
      title: 'IT Infrastructure Modernization',
      description: 'Complete overhaul of government IT systems including cloud migration, cybersecurity implementation, and staff training.',
      country: 'UK',
      budget: 2500000,
      currency: 'GBP',
      deadline: new Date('2025-04-30'),
      category: 'Technology',
      requirements: ['Cloud Computing', 'Cybersecurity', 'System Integration'],
      sourceUrl: 'https://ted.europa.eu/example-tender-2',
      sourceApi: 'ted',
      status: 'OPEN'
    },
    {
      title: 'Smart City IoT Implementation',
      description: 'Deploy IoT sensors and smart city infrastructure across metropolitan area including traffic management, environmental monitoring.',
      country: 'Singapore',
      budget: 8000000,
      currency: 'SGD',
      deadline: new Date('2025-05-20'),
      category: 'Technology',
      requirements: ['IoT', 'Smart Systems', 'Data Analytics'],
      sourceUrl: 'https://gebiz.gov.sg/example-tender-3',
      sourceApi: 'gebiz',
      status: 'OPEN'
    }
  ];

  for (const tender of sampleTenders) {
    await prisma.tender.create({
      data: tender
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: ${adminUser.email}`);
  console.log(`👤 Bidder user: ${bidderUser.email}`);
  console.log(`📋 Created ${sampleTenders.length} sample tenders`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
