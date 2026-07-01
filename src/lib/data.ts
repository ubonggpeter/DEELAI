export const JOBS = [
  {
    id: "annotation",
    title: "Image Annotation",
    sub: "Label & annotate AI training datasets for global tech labs",
    rate: "$850",
    rateUnit: "per month",
    color: "#00D4FF",
    dim: "rgba(0,212,255,.12)",
    stars: 5,
    tag: "Top Earning",
    tagC: "#00E5A0",
    locked: false,
  },
  {
    id: "transcription",
    title: "AI Voice Transcription",
    sub: "Transcribe & validate real-world audio datasets",
    rate: "$1,200",
    rateUnit: "per month",
    color: "#8B5CF6",
    dim: "rgba(139,92,246,.12)",
    stars: 4,
    tag: "High Demand",
    tagC: "#FFB800",
    locked: true,
  },
  {
    id: "moderation",
    title: "Content Intelligence",
    sub: "Review & rate AI-generated content for safety",
    rate: "$650",
    rateUnit: "per month",
    color: "#FFB800",
    dim: "rgba(255,184,0,.12)",
    stars: 4,
    tag: "Premium Pay",
    tagC: "#8B5CF6",
    locked: true,
  },
];

export const MODULES = [
  {
    id: 1,
    title: "Introduction to AI Data Labeling",
    dur: "45 mins",
    lessons: 6,
    desc: "Understand how human annotators power real AI systems at global scale.",
    topics: [
      "What is machine learning data?",
      "Why annotation matters",
      "Types of annotation jobs",
      "Quality standards & accuracy",
      "Global AI data market overview",
      "Your role as a DEELAi Contributor",
    ],
  },
  {
    id: 2,
    title: "Bounding Box Fundamentals",
    dur: "1.5 hrs",
    lessons: 8,
    desc: "Master drawing precise bounding boxes around objects for computer vision.",
    topics: [
      "Anatomy of a bounding box",
      "Precision vs speed tradeoffs",
      "Edge cases & partial objects",
      "Overlap and occlusion rules",
      "Vehicle & person annotation",
      "Tool shortcuts & efficiency",
      "Common beginner mistakes",
      "Practice drills",
    ],
  },
  {
    id: 3,
    title: "Image Classification & Tagging",
    dur: "1 hr",
    lessons: 5,
    desc: "Assign correct labels and attributes using client taxonomy guides.",
    topics: [
      "Label hierarchies explained",
      "Attribute tagging systems",
      "Multi-label classification",
      "Ambiguous case handling",
      "Client taxonomy deep dive",
      "Speed tagging techniques",
    ],
  },
  {
    id: 4,
    title: "Quality Assurance Standards",
    dur: "2 hrs",
    lessons: 7,
    desc: "DEELAi maintains 99.2% client satisfaction. Here is the quality framework that keeps our standards elite.",
    topics: [
      "DEELAi accuracy rubric",
      "Rejection criteria",
      "Self-review checklist",
      "Calibration exercises",
      "Feedback & revision workflow",
      "Accuracy score impact",
      "Top annotator habits",
    ],
  },
  {
    id: 5,
    title: "Platform Tools & Workspace",
    dur: "30 mins",
    lessons: 4,
    desc: "Navigate the annotation workspace and maximise your earning potential.",
    topics: [
      "Workspace interface tour",
      "Job queue management",
      "Keyboard shortcuts",
      "Salary & withdrawal system",
    ],
  },
];

export const QUIZ = [
  {
    q: "What is the primary purpose of image annotation in AI?",
    opts: [
      "Editing photos for social media",
      "Creating labelled training data for machine learning models",
      "Compressing images for storage",
      "Designing user interfaces",
    ],
    ans: 1,
  },
  {
    q: "When drawing a bounding box around a car, you should:",
    opts: [
      "Include only the car body, never the wheels",
      "Draw the box as tight as possible around the full visible car",
      "Leave extra padding of at least 50px on all sides",
      "Only box the front half of the car",
    ],
    ans: 1,
  },
  {
    q: "A partially occluded object should be:",
    opts: [
      "Ignored completely",
      "Annotated only if more than 50% is visible",
      "Always annotated with an occluded flag set",
      "Deleted from the job",
    ],
    ans: 2,
  },
  {
    q: "Which accuracy score maintains Contributor status on DEELAi?",
    opts: ["Above 70%", "Above 80%", "Above 90%", "Above 85%"],
    ans: 2,
  },
  {
    q: "What happens when accuracy drops below the threshold?",
    opts: [
      "The account is immediately deleted",
      "You enter a performance review with mandatory re-training",
      "Nothing changes",
      "You are automatically upgraded",
    ],
    ans: 1,
  },
  {
    q: "Multi-label classification means:",
    opts: [
      "An image belongs to only one category",
      "An image can be assigned multiple applicable labels simultaneously",
      "Labels must be applied in sequence",
      "Only one annotator works per image",
    ],
    ans: 1,
  },
];

export const ANNOTATION_IMGS = [
  {
    url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=640&h=420&fit=crop",
    label: "Urban Traffic Scene",
    objects: ["car", "road sign", "traffic light"],
  },
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=640&h=420&fit=crop",
    label: "Pedestrian Zone",
    objects: ["person", "dog", "sidewalk"],
  },
  {
    url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=640&h=420&fit=crop",
    label: "Retail Exterior",
    objects: ["person", "storefront", "bicycle"],
  },
];

export const LABELS = [
  "car", "person", "truck", "bicycle", "dog",
  "traffic light", "building", "tree", "motorcycle", "bus",
];

export const LEADERBOARD = [
  { rank: 1, name: "Chidi Okonkwo", country: "NG", salary: "$18,420", jobs: 1241, tier: "Permanent" },
  { rank: 2, name: "Aisha Mensah", country: "GH", salary: "$16,800", jobs: 1102, tier: "Permanent" },
  { rank: 3, name: "Kwame Asante", country: "GH", salary: "$15,990", jobs: 1044, tier: "Permanent" },
  { rank: 4, name: "Amara Osei", country: "NG", salary: "$14,750", jobs: 984, tier: "Associate", isMe: true },
  { rank: 5, name: "Fatima Bello", country: "NG", salary: "$13,200", jobs: 901, tier: "Associate" },
  { rank: 6, name: "Emeka Nwosu", country: "NG", salary: "$12,800", jobs: 876, tier: "Associate" },
  { rank: 7, name: "Sade Williams", country: "GB", salary: "$11,500", jobs: 820, tier: "Associate" },
  { rank: 8, name: "Tunde Adeyemi", country: "NG", salary: "$10,900", jobs: 794, tier: "Associate" },
];

export const NOTIFS = [
  { id: 1, title: "Job #A-2291 Approved", body: "Your annotation batch was accepted. +$12.50 added to your salary.", time: "2 mins ago", read: false, color: "#00E5A0", type: "check" },
  { id: 2, title: "Recruit Bonus Credited", body: "Chukwudi Eze completed 10 jobs. +$40.00 bonus added.", time: "1 hr ago", read: false, color: "#00D4FF", type: "users" },
  { id: 3, title: "7-Day Streak! Keep going", body: "You have worked 7 days in a row. A 10% bonus is now active.", time: "3 hrs ago", read: false, color: "#FFB800", type: "flame" },
  { id: 4, title: "Payout Friday", body: "Your salary of $14,750 will be processed this Friday.", time: "Yesterday", read: true, color: "#8B5CF6", type: "calendar" },
  { id: 5, title: "Accuracy Milestone", body: "You hit 97.4% accuracy. Permanent Staff threshold is 98%.", time: "2 days ago", read: true, color: "#00E5A0", type: "target" },
  { id: 6, title: "New Jobs Available", body: "85 new annotation batches are ready in your queue.", time: "3 days ago", read: true, color: "#00D4FF", type: "search" },
];

export const REGIONS = [
  {
    id: "na",
    name: "North America",
    color: "#00D4FF",
    agents: [
      { name: "James Mitchell", city: "New York, USA", status: "active" },
      { name: "Sarah Chen", city: "Toronto, Canada", status: "active" },
      { name: "Marcus Williams", city: "Chicago, USA", status: "duty" },
      { name: "Emma Rodriguez", city: "Miami, USA", status: "active" },
      { name: "Tyler Brooks", city: "Vancouver, Canada", status: "available" },
    ],
  },
  {
    id: "eu",
    name: "Europe",
    color: "#8B5CF6",
    agents: [
      { name: "Oliver Schmidt", city: "Berlin, Germany", status: "active" },
      { name: "Sophie Laurent", city: "Paris, France", status: "active" },
      { name: "James O'Brien", city: "London, UK", status: "duty" },
      { name: "Isabella Costa", city: "Lisbon, Portugal", status: "active" },
      { name: "Erik Lindgren", city: "Stockholm, Sweden", status: "available" },
    ],
  },
  {
    id: "wa",
    name: "West Africa",
    color: "#00E5A0",
    agents: [
      { name: "Gideon NSE", city: "Lagos, Nigeria", status: "active" },
      { name: "Spunky Ikole", city: "Abuja, Nigeria", status: "active" },
      { name: "Secret Love", city: "Port Harcourt, Nigeria", status: "duty" },
      { name: "Pedro Pius", city: "Accra, Ghana", status: "active" },
      { name: "Mama Gee", city: "Lagos, Nigeria", status: "available" },
    ],
  },
  {
    id: "ap",
    name: "Asia Pacific",
    color: "#FFB800",
    agents: [
      { name: "Ravi Sharma", city: "Mumbai, India", status: "active" },
      { name: "Liu Wei", city: "Shanghai, China", status: "active" },
      { name: "Yuki Tanaka", city: "Tokyo, Japan", status: "duty" },
      { name: "Min-Ji Park", city: "Seoul, South Korea", status: "active" },
      { name: "Ahmad Rizal", city: "Jakarta, Indonesia", status: "available" },
    ],
  },
  {
    id: "me",
    name: "Middle East",
    color: "#FF4D6D",
    agents: [
      { name: "Mohammed Al-Rashid", city: "Dubai, UAE", status: "active" },
      { name: "Layla Hassan", city: "Cairo, Egypt", status: "active" },
      { name: "Omar Khalil", city: "Riyadh, Saudi Arabia", status: "duty" },
      { name: "Nour Mansour", city: "Beirut, Lebanon", status: "active" },
      { name: "Yasmin Al-Ahmad", city: "Amman, Jordan", status: "available" },
    ],
  },
  {
    id: "la",
    name: "Latin America",
    color: "#F97316",
    agents: [
      { name: "Carlos Mendez", city: "São Paulo, Brazil", status: "active" },
      { name: "Ana García", city: "Mexico City, Mexico", status: "active" },
      { name: "Diego Fernandez", city: "Buenos Aires, Argentina", status: "duty" },
      { name: "Valentina Cruz", city: "Bogotá, Colombia", status: "active" },
      { name: "Lucas Silva", city: "Lima, Peru", status: "available" },
    ],
  },
];

export const TICKER = [
  "Gideon NSE just delivered a Job Pass to a new member in Lagos",
  "Sophie Laurent onboarded 3 new agents across Europe this morning",
  "Ravi Sharma guided a new member through certification in Mumbai",
  "James Mitchell activated a Job Pass for a member in New York",
  "Spunky Ikole completed a training session with 2 new recruits",
  "Layla Hassan welcomed a new member to the Middle East board",
  "Carlos Mendez delivered a Job Pass to a member in São Paulo",
  "Mama Gee is currently onboarding new members — reach out now",
  "Oliver Schmidt helped a new agent go live in under 24 hours",
  "Pedro Pius just confirmed a Job Pass activation in Accra",
];

export const GLOBE_DOTS = [
  { lat: 40, lng: -74, color: "#00D4FF" },
  { lat: 51, lng: 0, color: "#8B5CF6" },
  { lat: 6, lng: 3, color: "#00E5A0" },
  { lat: 19, lng: 73, color: "#FFB800" },
  { lat: 25, lng: 55, color: "#FF4D6D" },
  { lat: -23, lng: -46, color: "#F97316" },
];
