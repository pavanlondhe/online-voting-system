export type Language = 'en' | 'mr' | 'hi';

export const translations = {
  en: {
    portalName: 'MahaVote',
    portalSubTitle: 'Maharashtra Election Management Portal',
    portalTagline: 'Educational Demonstration Platform — Not an Official Election Service',
    officialStateNotice: 'Government of Maharashtra Demonstration Prototype • State Electoral Management Simulator',
    
    // Nav
    navHome: 'Home',
    navElections: 'Elections',
    navCandidates: 'Candidates',
    navVoterServices: 'Voter Services',
    navResults: 'Results',
    navHelp: 'Help & FAQs',
    navAdmin: 'Official Portal',
    navLogin: 'Sign In',
    navRegister: 'Register',
    navLogout: 'Sign Out',
    navDashboard: 'Dashboard',

    // Hero
    heroTitle: 'Your Voice. Your Vote. Your Maharashtra.',
    heroSubtitle: 'A modern, secure, and privacy-preserving simulated election management platform for Maharashtra voters, candidates, and electoral officers.',
    btnCheckEligibility: 'Check Voter Eligibility',
    btnExploreElections: 'Browse Elections',
    btnCastVote: 'Cast Simulated Vote',
    btnViewResults: 'View Live Results',
    btnAdminLogin: 'Official Admin Login',
    btnCandidatePortal: 'Candidate Portal',

    // Badges & Statuses
    statusActive: 'Active & Voting Open',
    statusScheduled: 'Scheduled',
    statusPaused: 'Paused',
    statusClosed: 'Voting Closed',
    statusDeclared: 'Results Declared',
    
    // Election Types
    typeAssembly: 'Legislative Assembly',
    typeParliamentary: 'Parliamentary (Lok Sabha)',
    typeMunicipalCorp: 'Municipal Corporation',
    typeMunicipalCouncil: 'Municipal Council',
    typeGramPanchayat: 'Gram Panchayat',
    typeStudent: 'Student Council',

    // Common labels
    district: 'District',
    constituency: 'Constituency',
    electionType: 'Election Type',
    status: 'Status',
    search: 'Search',
    all: 'All',
    viewDetails: 'View Details',
    candidatesCount: 'Candidates',
    startDate: 'Start Date',
    endDate: 'End Date',
    eligibleVoters: 'Eligible Voters',
    votesCast: 'Votes Cast',
    turnout: 'Turnout Rate',
    nota: 'None of the Above (NOTA)',

    // Voting Flow
    votingBooth: 'Simulated EVM Voting Booth',
    stepIdentity: '1. Identity Check',
    stepBallot: '2. Select Choice',
    stepReview: '3. Verify & Confirm',
    stepReceipt: '4. Digital Receipt',
    confirmChoicePrompt: 'Please verify your selected candidate before final submission.',
    submitVoteBtn: 'Submit Secure Vote',
    privacyNote: 'Zero-Knowledge Privacy: Your choice is stored in an anonymized ballot pool. The receipt reference verifies submission without revealing your candidate.',
    downloadReceipt: 'Download Receipt (PDF)',
    voteSuccess: 'Your simulated vote has been cast and recorded successfully!',

    // Disclaimer
    disclaimerTitle: 'Educational Demonstration Notice',
    disclaimerText: 'This is an independent educational and demonstration portal inspired by the Election Commission of India EVM Management System. It does not collect real Aadhaar/EPIC data and does not represent official government elections.',
    disclaimerBanner: 'Educational Demonstration Platform — Not an Official Election Service.',
  },

  mr: {
    portalName: 'महावोट',
    portalSubTitle: 'महाराष्ट्र निवडणूक व्यवस्थापन पोर्टल',
    portalTagline: 'शैक्षणिक प्रात्यक्षिक व्यासपीठ — अधिकृत निवडणूक सेवा नाही',
    officialStateNotice: 'महाराष्ट्र शासन प्रात्यक्षिक प्रणाली • राज्य निवडणूक व्यवस्थापन सिम्युलेटर',

    // Nav
    navHome: 'मुख्यपृष्ठ',
    navElections: 'निवडणुका',
    navCandidates: 'उमेदवार',
    navVoterServices: 'मतदार सेवा',
    navResults: 'निकाल',
    navHelp: 'मदत व मार्गदर्शन',
    navAdmin: 'अधिकारी पोर्टल',
    navLogin: 'प्रवेश करा',
    navRegister: 'नोंदणी करा',
    navLogout: 'बाहेर पडा',
    navDashboard: 'डॅशबोर्ड',

    // Hero
    heroTitle: 'तुमचा आवाज. तुमचे मत. आपला महाराष्ट्र.',
    heroSubtitle: 'महाराष्ट्रातील मतदार, उमेदवार आणि निवडणूक अधिकाऱ्यांसाठी आधुनिक, सुरक्षित आणि गोपनीयता-संरक्षक प्रात्यक्षिक निवडणूक व्यवस्थापन व्यासपीठ.',
    btnCheckEligibility: 'मतदार पात्रता तपासा',
    btnExploreElections: 'निवडणुका पहा',
    btnCastVote: 'प्रात्यक्षिक मतदान करा',
    btnViewResults: 'थेट निकाल पहा',
    btnAdminLogin: 'अधिकारी लॉगिन',
    btnCandidatePortal: 'उमेदवार पोर्टल',

    // Badges & Statuses
    statusActive: 'मतदान सुरू आहे',
    statusScheduled: 'नियोजित',
    statusPaused: 'स्थगित',
    statusClosed: 'मतदान समाप्त',
    statusDeclared: 'निकाल जाहीर',

    // Election Types
    typeAssembly: 'विधानसभा सार्वत्रिक',
    typeParliamentary: 'लोकसभा संसदीय',
    typeMunicipalCorp: 'महानगरपालिका',
    typeMunicipalCouncil: 'नगरपरिषद',
    typeGramPanchayat: 'ग्रामपंचायत',
    typeStudent: 'विद्यार्थी परिषद',

    // Common labels
    district: 'जिल्हा',
    constituency: 'मतदारसंघ',
    electionType: 'निवडणूक प्रकार',
    status: 'स्थिती',
    search: 'शोधा',
    all: 'सर्व',
    viewDetails: 'तपशील पहा',
    candidatesCount: 'उमेदवार संख्या',
    startDate: 'सुरुवात तारीख',
    endDate: 'शेवटची तारीख',
    eligibleVoters: 'पात्र मतदार',
    votesCast: 'झालेले मतदान',
    turnout: 'मतदान टक्केवारी',
    nota: 'नोटा (वरीलपैकी कोणालाही नाही)',

    // Voting Flow
    votingBooth: 'प्रात्यक्षिक ईव्हीएम मतदान कक्ष',
    stepIdentity: '१. ओळख पडताळणी',
    stepBallot: '२. पसंती निवडा',
    stepReview: '३. खात्री करा',
    stepReceipt: '४. डिजिटल पावती',
    confirmChoicePrompt: 'कृपया अंतिम सबमिशन करण्यापूर्वी आपली निवड तपासा.',
    submitVoteBtn: 'सुरक्षित मत नोंदवा',
    privacyNote: 'गोपनीयता हमी: तुमचे मत गुप्त ठेवले जाते. पावतीवर तुमचा उमेदवार कधीही दर्शवला जात नाही.',
    downloadReceipt: 'पावती डाउनलोड करा (PDF)',
    voteSuccess: 'तुमचे प्रात्यक्षिक मत यशस्वीरित्या नोंदवले गेले आहे!',

    // Disclaimer
    disclaimerTitle: 'शैक्षणिक प्रात्यक्षिक सूचना',
    disclaimerText: 'हे व्यासपीठ केवळ शैक्षणिक आणि प्रात्यक्षिक अभ्यासासाठी आहे. हे भारतीय निवडणूक आयोग किंवा राज्य निवडणूक आयोगाची अधिकृत सेवा नाही.',
    disclaimerBanner: 'शैक्षणिक प्रात्यक्षिक व्यासपीठ — अधिकृत निवडणूक सेवा नाही.',
  },

  hi: {
    portalName: 'महावोट',
    portalSubTitle: 'महाराष्ट्र चुनाव प्रबंधन पोर्टल',
    portalTagline: 'शैक्षणिक प्रदर्शन मंच — आधिकारिक चुनाव सेवा नहीं',
    officialStateNotice: 'महाराष्ट्र सरकार प्रदर्शन प्रारूप • राज्य निर्वाचन प्रबंधन सिम्युलेटर',

    // Nav
    navHome: 'होम',
    navElections: 'चुनाव',
    navCandidates: 'उम्मीदवार',
    navVoterServices: 'मतदाता सेवाएं',
    navResults: 'परिणाम',
    navHelp: 'सहायता एवं प्रश्न',
    navAdmin: 'अधिकारी पोर्टल',
    navLogin: 'लॉग इन',
    navRegister: 'पंजीकरण',
    navLogout: 'लॉग आउट',
    navDashboard: 'डैशबोर्ड',

    // Hero
    heroTitle: 'आपकी आवाज़। आपका वोट। आपका महाराष्ट्र।',
    heroSubtitle: 'महाराष्ट्र के मतदाताओं, उम्मीदवारों और चुनाव अधिकारियों के लिए आधुनिक, सुरक्षित एवं गोपनीयता-युक्त प्रदर्शन चुनाव प्रबंधन मंच।',
    btnCheckEligibility: 'मतदाता पात्रता जांचें',
    btnExploreElections: 'चुनाव देखें',
    btnCastVote: 'प्रतीकात्मक मतदान करें',
    btnViewResults: 'चुनाव परिणाम देखें',
    btnAdminLogin: 'अधिकारी लॉगिन',
    btnCandidatePortal: 'उम्मीदवार पोर्टल',

    // Badges & Statuses
    statusActive: 'मतदान चालू है',
    statusScheduled: 'प्रस्तावित',
    statusPaused: 'स्थगित',
    statusClosed: 'मतदान समाप्त',
    statusDeclared: 'परिणाम घोषित',

    // Election Types
    typeAssembly: 'विधानसभा आम चुनाव',
    typeParliamentary: 'लोकसभा संसदीय',
    typeMunicipalCorp: 'नगर निगम',
    typeMunicipalCouncil: 'नगर परिषद',
    typeGramPanchayat: 'ग्राम पंचायत',
    typeStudent: 'छात्र संघ',

    // Common labels
    district: 'जिला',
    constituency: 'निर्वाचन क्षेत्र',
    electionType: 'चुनाव प्रकार',
    status: 'स्थिति',
    search: 'खोजें',
    all: 'सभी',
    viewDetails: 'विवरण देखें',
    candidatesCount: 'उम्मीदवार',
    startDate: 'आरंभ तिथि',
    endDate: 'समाप्ति तिथि',
    eligibleVoters: 'पात्र मतदाता',
    votesCast: 'डाले गए मत',
    turnout: 'मतदान प्रतिशत',
    nota: 'नोटा (उपरोक्त में से कोई नहीं)',

    // Voting Flow
    votingBooth: 'प्रतीकात्मक ईवीएम मतदान कक्ष',
    stepIdentity: '१. पहचान सत्यापन',
    stepBallot: '२. विकल्प चुनें',
    stepReview: '३. समीक्षा एवं पुष्टि',
    stepReceipt: '४. डिजिटल रसीद',
    confirmChoicePrompt: 'कृपया अंतिम सबमिशन से पहले अपने चुने हुए विकल्प की पुष्टि करें।',
    submitVoteBtn: 'सुरक्षित वोट दर्ज करें',
    privacyNote: 'गोपनीयता संरक्षण: आपका वोट गोपनीय रहता है। रसीद पर उम्मीदवार का नाम कभी नहीं दिखाया जाता।',
    downloadReceipt: 'रसीद डाउनलोड करें (PDF)',
    voteSuccess: 'आपका प्रतीकात्मक मत सफलतापूर्वक दर्ज कर लिया गया है!',

    // Disclaimer
    disclaimerTitle: 'शैक्षणिक प्रदर्शन सूचना',
    disclaimerText: 'यह मंच केवल शैक्षणिक एवं तकनीकी प्रदर्शन हेतु निर्मित है। यह भारत निर्वाचन आयोग की आधिकारिक सेवा नहीं है।',
    disclaimerBanner: 'शैक्षणिक प्रदर्शन मंच — आधिकारिक चुनाव सेवा नहीं।',
  },
};
