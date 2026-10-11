import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MahaVote demonstration database...');

  // 1. Clean existing records (in reverse relation order)
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.electionResult.deleteMany();
  await prisma.voteReceipt.deleteMany();
  await prisma.ballot.deleteMany();
  await prisma.voteParticipation.deleteMany();
  await prisma.nomination.deleteMany();
  await prisma.electionCandidate.deleteMany();
  await prisma.election.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.voterProfile.deleteMany();
  await prisma.oTPChallenge.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.district.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default passwords
  const passwordAdmin = await bcrypt.hash('Admin@12345', 10);
  const passwordStateAdmin = await bcrypt.hash('StateAdmin@12345', 10);
  const passwordDeo = await bcrypt.hash('DeoPune@12345', 10);
  const passwordRo = await bcrypt.hash('RoKasba@12345', 10);
  const passwordAuditor = await bcrypt.hash('Auditor@12345', 10);
  const passwordVoter = await bcrypt.hash('Voter@12345', 10);
  const passwordCandidate = await bcrypt.hash('Candidate@12345', 10);

  // 3. Seed Administrative Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@mahavote.gov.in',
      phone: '9800000001',
      fullName: 'Shri Rajesh Deshmukh, IAS (Super Admin)',
      passwordHash: passwordAdmin,
      role: 'SUPER_ADMIN',
    },
  });

  const stateAdmin = await prisma.user.create({
    data: {
      email: 'state.admin@mahavote.gov.in',
      phone: '9800000002',
      fullName: 'Smt. Vandana Suryavanshi (State Election Commissioner)',
      passwordHash: passwordStateAdmin,
      role: 'STATE_ELECTION_ADMIN',
    },
  });

  const deoPune = await prisma.user.create({
    data: {
      email: 'deo.pune@mahavote.gov.in',
      phone: '9800000003',
      fullName: 'Dr. Suhas Diwase (District Election Officer, Pune)',
      passwordHash: passwordDeo,
      role: 'DISTRICT_ELECTION_OFFICER',
    },
  });

  const roKasba = await prisma.user.create({
    data: {
      email: 'ro.kasba@mahavote.gov.in',
      phone: '9800000004',
      fullName: 'Shri Milind Mohite (Returning Officer, Kasba Peth)',
      passwordHash: passwordRo,
      role: 'RETURNING_OFFICER',
    },
  });

  const auditor = await prisma.user.create({
    data: {
      email: 'auditor@mahavote.gov.in',
      phone: '9800000005',
      fullName: 'Smt. Neha Gaikwad (Independent Electoral Auditor)',
      passwordHash: passwordAuditor,
      role: 'AUDITOR',
    },
  });

  // 4. Seed Districts
  const puneDistrict = await prisma.district.create({
    data: {
      name: 'Pune',
      nameMr: 'पुणे',
      nameHi: 'पुणे',
      code: 'MH-PUN',
      division: 'Pune',
      state: 'Maharashtra',
    },
  });

  const mumbaiCityDistrict = await prisma.district.create({
    data: {
      name: 'Mumbai City',
      nameMr: 'मुंबई शहर',
      nameHi: 'मुंबई शहर',
      code: 'MH-MC',
      division: 'Konkan',
      state: 'Maharashtra',
    },
  });

  const mumbaiSuburbanDistrict = await prisma.district.create({
    data: {
      name: 'Mumbai Suburban',
      nameMr: 'मुंबई उपनगर',
      nameHi: 'मुंबई उपनगर',
      code: 'MH-MS',
      division: 'Konkan',
      state: 'Maharashtra',
    },
  });

  const nagpurDistrict = await prisma.district.create({
    data: {
      name: 'Nagpur',
      nameMr: 'नागपूर',
      nameHi: 'नागपुर',
      code: 'MH-NGP',
      division: 'Vidarbha',
      state: 'Maharashtra',
    },
  });

  const nashikDistrict = await prisma.district.create({
    data: {
      name: 'Nashik',
      nameMr: 'नाशिक',
      nameHi: 'नासिक',
      code: 'MH-NSK',
      division: 'Nashik',
      state: 'Maharashtra',
    },
  });

  const csbDistrict = await prisma.district.create({
    data: {
      name: 'Chhatrapati Sambhajinagar',
      nameMr: 'छत्रपती संभाजीनगर',
      nameHi: 'छत्रपति संभाजीनगर',
      code: 'MH-CSN',
      division: 'Marathwada',
      state: 'Maharashtra',
    },
  });

  const kolhapurDistrict = await prisma.district.create({
    data: {
      name: 'Kolhapur',
      nameMr: 'कोल्हापूर',
      nameHi: 'कोल्हापुर',
      code: 'MH-KLP',
      division: 'Pune',
      state: 'Maharashtra',
    },
  });

  const thaneDistrict = await prisma.district.create({
    data: {
      name: 'Thane',
      nameMr: 'ठाणे',
      nameHi: 'ठाणे',
      code: 'MH-THN',
      division: 'Konkan',
      state: 'Maharashtra',
    },
  });

  // 5. Seed Constituencies
  const kasbaPeth = await prisma.constituency.create({
    data: {
      name: '215 - Kasba Peth',
      nameMr: '२१५ - कसबा पेठ',
      nameHi: '२१५ - कसबा पेठ',
      code: 'MH-AC-215',
      type: 'ASSEMBLY',
      districtId: puneDistrict.id,
    },
  });

  const shivajinagar = await prisma.constituency.create({
    data: {
      name: '214 - Shivajinagar',
      nameMr: '२१४ - शिवाजीनगर',
      nameHi: '२१४ - शिवाजीनगर',
      code: 'MH-AC-214',
      type: 'ASSEMBLY',
      districtId: puneDistrict.id,
    },
  });

  const kothrud = await prisma.constituency.create({
    data: {
      name: '216 - Kothrud',
      nameMr: '२१६ - कोथरुड',
      nameHi: '२१६ - कोथरुड',
      code: 'MH-AC-216',
      type: 'ASSEMBLY',
      districtId: puneDistrict.id,
    },
  });

  const punePC = await prisma.constituency.create({
    data: {
      name: '34 - Pune Parliamentary',
      nameMr: '३४ - पुणे लोकसभा मतदारसंघ',
      nameHi: '३४ - पुणे लोकसभा निर्वाचन क्षेत्र',
      code: 'MH-PC-34',
      type: 'PARLIAMENTARY',
      districtId: puneDistrict.id,
    },
  });

  const puneWard12 = await prisma.constituency.create({
    data: {
      name: 'PMC Ward 12 - Model Colony',
      nameMr: 'पुणे महापालिका प्रभाग १२',
      nameHi: 'पुणे नगर निगम वार्ड १२',
      code: 'MH-PMC-W12',
      type: 'MUNICIPAL',
      districtId: puneDistrict.id,
    },
  });

  const colaba = await prisma.constituency.create({
    data: {
      name: '187 - Colaba',
      nameMr: '१८७ - कुलाबा',
      nameHi: '१८७ - कोलाबा',
      code: 'MH-AC-187',
      type: 'ASSEMBLY',
      districtId: mumbaiCityDistrict.id,
    },
  });

  const bandraWest = await prisma.constituency.create({
    data: {
      name: '177 - Bandra West',
      nameMr: '१७७ - वांद्रे पश्चिम',
      nameHi: '१७७ - बांद्रा पश्चिम',
      code: 'MH-AC-177',
      type: 'ASSEMBLY',
      districtId: mumbaiSuburbanDistrict.id,
    },
  });

  const baramatiGram = await prisma.constituency.create({
    data: {
      name: 'Baramati Rural Ward 01',
      nameMr: 'बारामती ग्रामपंचायत प्रभाग ०१',
      nameHi: 'बारामती ग्राम पंचायत वार्ड ०१',
      code: 'MH-GP-BAR-01',
      type: 'PANCHAYAT',
      districtId: puneDistrict.id,
    },
  });

  // 6. Seed Demo Voters
  const voter1User = await prisma.user.create({
    data: {
      email: 'voter1@mahavote.demo',
      phone: '9876543210',
      fullName: 'Aarav Suresh Kulkarni',
      passwordHash: passwordVoter,
      role: 'VOTER',
    },
  });

  const voter1Profile = await prisma.voterProfile.create({
    data: {
      userId: voter1User.id,
      voterUid: 'MH-VTR-2026-A101',
      dateOfBirth: new Date('1996-04-15'),
      gender: 'MALE',
      districtId: puneDistrict.id,
      constituencyId: kasbaPeth.id,
      address: '142 Shaniwar Peth, Pune 411030',
      isVerified: true,
    },
  });

  const voter2User = await prisma.user.create({
    data: {
      email: 'voter2@mahavote.demo',
      phone: '9876543211',
      fullName: 'Tanvi Mahesh Joshi',
      passwordHash: passwordVoter,
      role: 'VOTER',
    },
  });

  await prisma.voterProfile.create({
    data: {
      userId: voter2User.id,
      voterUid: 'MH-VTR-2026-B202',
      dateOfBirth: new Date('2001-08-22'),
      gender: 'FEMALE',
      districtId: puneDistrict.id,
      constituencyId: shivajinagar.id,
      address: '45 FC Road, Shivajinagar, Pune 411005',
      isVerified: true,
    },
  });

  const voter3User = await prisma.user.create({
    data: {
      email: 'voter3@mahavote.demo',
      phone: '9876543212',
      fullName: 'Prathamesh Ashok Patil',
      passwordHash: passwordVoter,
      role: 'VOTER',
    },
  });

  await prisma.voterProfile.create({
    data: {
      userId: voter3User.id,
      voterUid: 'MH-VTR-2026-C303',
      dateOfBirth: new Date('1988-11-03'),
      gender: 'MALE',
      districtId: mumbaiCityDistrict.id,
      constituencyId: colaba.id,
      address: '12 Cuffe Parade, Colaba, Mumbai 400005',
      isVerified: true,
    },
  });

  // 7. Seed Demo Candidates
  // Candidate 1: Ananya Deshmukh (Independent - Tree)
  const c1User = await prisma.user.create({
    data: {
      email: 'ananya@candidate.demo',
      phone: '9822000001',
      fullName: 'Ananya Deshmukh',
      passwordHash: passwordCandidate,
      role: 'CANDIDATE',
    },
  });
  const c1Profile = await prisma.candidateProfile.create({
    data: {
      userId: c1User.id,
      partyAffiliation: 'Independent',
      symbolName: 'Tree',
      symbolIcon: 'tree-pine',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      manifesto: 'Commitment to urban tree cover, modern public libraries, clean civic tap water, and youth skill workshops in Kasba Peth.',
      biography: 'Social activist and environmental researcher with 10 years of public service experience in urban ecology and civic policy.',
      education: 'M.Sc. Environmental Science, Savitribai Phule Pune University',
      assetsDeclaration: 'Demonstration Asset Disclosure: Movable assets ₹14.5 Lakhs, Immovable assets ₹32 Lakhs. Zero criminal cases pending.',
      constituencyId: kasbaPeth.id,
    },
  });

  // Candidate 2: Rahul Patil (Independent - Book)
  const c2User = await prisma.user.create({
    data: {
      email: 'rahul@candidate.demo',
      phone: '9822000002',
      fullName: 'Rahul Patil',
      passwordHash: passwordCandidate,
      role: 'CANDIDATE',
    },
  });
  const c2Profile = await prisma.candidateProfile.create({
    data: {
      userId: c2User.id,
      partyAffiliation: 'Independent',
      symbolName: 'Book',
      symbolIcon: 'book-open',
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
      manifesto: 'Strengthening government school infrastructure, digital classrooms, youth scholarship funds, and transparent municipal services.',
      biography: 'Former teacher and community library founder active in education reform and student mentoring initiatives.',
      education: 'B.Ed, M.A. Public Administration, Pune University',
      assetsDeclaration: 'Demonstration Asset Disclosure: Movable assets ₹11.2 Lakhs, Immovable assets ₹28 Lakhs. Zero criminal cases pending.',
      constituencyId: kasbaPeth.id,
    },
  });

  // Candidate 3: Sneha Jadhav (Independent - Lamp)
  const c3User = await prisma.user.create({
    data: {
      email: 'sneha@candidate.demo',
      phone: '9822000003',
      fullName: 'Sneha Jadhav',
      passwordHash: passwordCandidate,
      role: 'CANDIDATE',
    },
  });
  const c3Profile = await prisma.candidateProfile.create({
    data: {
      userId: c3User.id,
      partyAffiliation: 'Independent',
      symbolName: 'Lamp',
      symbolIcon: 'flame',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      manifesto: 'Safe street lighting in all alleys, 24/7 women safety helplines, maternal health clinics, and support for micro-entrepreneurs.',
      biography: 'Advocate and grassroots legal aid volunteer committed to municipal hygiene, heritage conservation, and elderly care.',
      education: 'LL.B., ILS Law College Pune',
      assetsDeclaration: 'Demonstration Asset Disclosure: Movable assets ₹18.0 Lakhs, Immovable assets ₹45 Lakhs. Zero criminal cases pending.',
      constituencyId: kasbaPeth.id,
    },
  });

  // Candidate 4: Vikram Shinde (Maharashtra Vikas Sangathan Demo - Sun)
  const c4User = await prisma.user.create({
    data: {
      email: 'vikram@candidate.demo',
      phone: '9822000004',
      fullName: 'Vikram Shinde',
      passwordHash: passwordCandidate,
      role: 'CANDIDATE',
    },
  });
  const c4Profile = await prisma.candidateProfile.create({
    data: {
      userId: c4User.id,
      partyAffiliation: 'Maharashtra Vikas Sangathan (Demo)',
      symbolName: 'Sun',
      symbolIcon: 'sun',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      manifesto: 'Solar powered streetlights, upgraded bus feeder routes, pothole-free ward roads, and modern garbage segregation plants.',
      biography: 'Mechanical engineer and former municipal corporator focused on renewable energy and urban traffic decongestion.',
      education: 'B.Tech Mechanical Engineering, COEP Tech University',
      assetsDeclaration: 'Demonstration Asset Disclosure: Movable assets ₹22.5 Lakhs, Immovable assets ₹60 Lakhs. Zero criminal cases pending.',
      constituencyId: kasbaPeth.id,
    },
  });

  // Candidate 5: Priya Kulkarni (Pragati Dal Demo - Pen)
  const c5User = await prisma.user.create({
    data: {
      email: 'priya@candidate.demo',
      phone: '9822000005',
      fullName: 'Priya Kulkarni',
      passwordHash: passwordCandidate,
      role: 'CANDIDATE',
    },
  });
  const c5Profile = await prisma.candidateProfile.create({
    data: {
      userId: c5User.id,
      partyAffiliation: 'Pragati Dal (Demo)',
      symbolName: 'Pen',
      symbolIcon: 'pen-tool',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      manifesto: 'Transparent ward budgetary audits, citizen grievance redressing app, preservation of old wadas, and public parks.',
      biography: 'Chartered accountant and public finance policy consultant advocating for municipal governance efficiency.',
      education: 'FCA, Institute of Chartered Accountants of India',
      assetsDeclaration: 'Demonstration Asset Disclosure: Movable assets ₹25.0 Lakhs, Immovable assets ₹55 Lakhs. Zero criminal cases pending.',
      constituencyId: kasbaPeth.id,
    },
  });

  // 8. Seed Demo Elections
  // Election 1: Maharashtra Legislative Assembly Election 2026 (Demo) - Kasba Peth (ACTIVE)
  const now = new Date();
  const startDateActive = new Date(now.getTime() - 24 * 60 * 60 * 1000); // started yesterday
  const endDateActive = new Date(now.getTime() + 48 * 60 * 60 * 1000); // ends in 2 days

  const electionAssembly = await prisma.election.create({
    data: {
      title: 'Maharashtra Legislative Assembly Election 2026 — Kasba Peth (Demo)',
      titleMr: 'महाराष्ट्र विधानसभा सार्वत्रिक निवडणूक २०२६ — कसबा पेठ (डेमो)',
      titleHi: 'महाराष्ट्र विधान सभा आम चुनाव २०२६ — कसबा पेठ (डेमो)',
      description: 'Simulated demonstration election for the 215 - Kasba Peth Assembly Constituency under Pune District.',
      electionType: 'ASSEMBLY',
      status: 'ACTIVE',
      startDate: startDateActive,
      endDate: endDateActive,
      districtId: puneDistrict.id,
      constituencyId: kasbaPeth.id,
      createdByUserId: superAdmin.id,
      totalEligibleVoters: 284500,
    },
  });

  // Assign candidates to Active Assembly Election
  const candidatesList = [
    { profile: c1Profile, order: 1 },
    { profile: c2Profile, order: 2 },
    { profile: c3Profile, order: 3 },
    { profile: c4Profile, order: 4 },
    { profile: c5Profile, order: 5 },
  ];

  for (const c of candidatesList) {
    await prisma.electionCandidate.create({
      data: {
        electionId: electionAssembly.id,
        candidateId: c.profile.id,
        ballotOrder: c.order,
        status: 'CONTESTING',
      },
    });

    await prisma.nomination.create({
      data: {
        electionId: electionAssembly.id,
        candidateId: c.profile.id,
        status: 'APPROVED',
        affidavitSummary: `Demonstration nomination affidavit verified and accepted according to Demo Election Rule 2026.`,
        reviewedByUserId: roKasba.id,
        reviewRemarks: 'All educational demonstration documents and asset forms verified successfully.',
        reviewedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
    });
  }

  // Election 2: Pune Municipal Corporation Election 2026 (Demo) - Ward 12 (ACTIVE)
  const electionMunicipal = await prisma.election.create({
    data: {
      title: 'Pune Municipal Corporation General Election 2026 — Ward 12 (Demo)',
      titleMr: 'पुणे महानगरपालिका सार्वत्रिक निवडणूक २०२६ — प्रभाग १२ (डेमो)',
      titleHi: 'पुणे नगर निगम आम चुनाव २०२६ — वार्ड १२ (डेमो)',
      description: 'Simulated municipal corporation civic election for Model Colony Ward 12, Pune.',
      electionType: 'MUNICIPAL_CORP',
      status: 'ACTIVE',
      startDate: startDateActive,
      endDate: endDateActive,
      districtId: puneDistrict.id,
      constituencyId: puneWard12.id,
      createdByUserId: deoPune.id,
      totalEligibleVoters: 45200,
    },
  });

  await prisma.electionCandidate.create({
    data: { electionId: electionMunicipal.id, candidateId: c1Profile.id, ballotOrder: 1, status: 'CONTESTING' },
  });
  await prisma.electionCandidate.create({
    data: { electionId: electionMunicipal.id, candidateId: c4Profile.id, ballotOrder: 2, status: 'CONTESTING' },
  });

  // Election 3: Maharashtra Parliamentary Election (Demo) - Scheduled
  const startDateFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endDateFuture = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);

  const electionParliament = await prisma.election.create({
    data: {
      title: 'Maharashtra Parliamentary (Lok Sabha) Election 2026 — Pune PC (Demo)',
      titleMr: 'महाराष्ट्र लोकसभा सार्वत्रिक निवडणूक २०२६ — पुणे (डेमो)',
      titleHi: 'महाराष्ट्र लोकसभा आम चुनाव २०२६ — पुणे (डेमो)',
      description: 'Scheduled demonstration parliamentary election for 34 - Pune Parliamentary Constituency.',
      electionType: 'PARLIAMENTARY',
      status: 'SCHEDULED',
      startDate: startDateFuture,
      endDate: endDateFuture,
      districtId: puneDistrict.id,
      constituencyId: punePC.id,
      createdByUserId: stateAdmin.id,
      totalEligibleVoters: 1980000,
    },
  });

  // Election 4: Baramati Gram Panchayat Election (Demo) - CLOSED & RESULTS DECLARED
  const startDatePast = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const endDatePast = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const electionPanchayat = await prisma.election.create({
    data: {
      title: 'Baramati Gram Panchayat General Election (Demo)',
      titleMr: 'बारामती ग्रामपंचायत सार्वत्रिक निवडणूक (डेमो)',
      titleHi: 'बारामती ग्राम पंचायत आम चुनाव (डेमो)',
      description: 'Completed local self-government Gram Panchayat election demo with declared results.',
      electionType: 'GRAM_PANCHAYAT',
      status: 'RESULTS_DECLARED',
      startDate: startDatePast,
      endDate: endDatePast,
      districtId: puneDistrict.id,
      constituencyId: baramatiGram.id,
      createdByUserId: deoPune.id,
      totalEligibleVoters: 2500,
    },
  });

  await prisma.electionCandidate.create({
    data: { electionId: electionPanchayat.id, candidateId: c2Profile.id, ballotOrder: 1, status: 'CONTESTING' },
  });
  await prisma.electionCandidate.create({
    data: { electionId: electionPanchayat.id, candidateId: c3Profile.id, ballotOrder: 2, status: 'CONTESTING' },
  });

  // Seed Result for the closed election
  const panchayatTallies = [
    {
      candidateId: c2Profile.id,
      candidateName: 'Rahul Patil',
      party: 'Independent',
      symbol: 'Book',
      votes: 1142,
      percentage: 59.4,
      isWinner: true,
    },
    {
      candidateId: c3Profile.id,
      candidateName: 'Sneha Jadhav',
      party: 'Independent',
      symbol: 'Lamp',
      votes: 728,
      percentage: 37.9,
      isWinner: false,
    },
    {
      candidateId: null,
      candidateName: 'NOTA (None of the Above)',
      party: 'None',
      symbol: 'Crossed Ballot',
      votes: 52,
      percentage: 2.7,
      isWinner: false,
    },
  ];

  await prisma.electionResult.create({
    data: {
      electionId: electionPanchayat.id,
      totalVotesCast: 1922,
      notaCount: 52,
      turnoutPercentage: 76.88,
      talliesJson: JSON.stringify(panchayatTallies),
      winnerSummary: 'Rahul Patil (Independent - Book) declared winner by a margin of 414 votes.',
      declaredAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZATION',
      resource: 'MahaVote Platform',
      details: JSON.stringify({ note: 'MahaVote educational election platform initialized with seed data' }),
      severity: 'INFO',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: stateAdmin.id,
      action: 'ELECTION_PUBLISHED',
      resource: 'Election: ' + electionAssembly.id,
      details: JSON.stringify({ electionTitle: electionAssembly.title, status: 'ACTIVE' }),
      severity: 'INFO',
    },
  });

  console.log('Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
