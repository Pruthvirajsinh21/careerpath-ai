import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type UserRole = { #student; #employee };

  module UserRole {
    public func toText(role : UserRole) : Text {
      switch (role) { case (#student) { "student" }; case (#employee) { "employee" } };
    };
  };

  type UserProfile = {
    name : Text; role : UserRole; bio : Text;
    interests : [Text]; skills : [Text];
    personalityTraits : [Text]; workStylePreferences : [Text];
  };

  type Job = {
    title : Text; description : Text;
    requiredInterests : [Text]; requiredSkills : [Text];
    salaryRange : Text; growthOutlook : Text;
  };

  module Job {
    public func compare(a : Job, b : Job) : Order.Order { Text.compare(a.title, b.title) };
    public func toText(j : Job) : Text { j.title };
  };

  type Message = { role : Text; content : Text };

  type JobMatchResult = { job : Job; score : Nat };

  module JobMatchResult {
    public func compare(a : JobMatchResult, b : JobMatchResult) : Order.Order { Nat.compare(b.score, a.score) };
    public func toText(m : JobMatchResult) : Text { m.job.title # " (" # m.score.toText() # ")" };
  };

  type UserCredential = { username : Text; email : Text; passwordHash : Text };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  let conversations = Map.empty<Principal, [Message]>();
  let credentials = Map.empty<Text, UserCredential>(); // keyed by email

  // Auto-initialize jobs at startup
  let jobs = Map.empty<Text, Job>();
  do {
    let jobList : [Job] = [
      // Technology
      { title = "Software Developer"; description = "Develops computer programs and applications."; requiredInterests = ["Technology"]; requiredSkills = ["Programming", "Critical Thinking"]; salaryRange = "$70,000 - $120,000"; growthOutlook = "High" },
      { title = "Web Developer"; description = "Builds and maintains websites and web applications."; requiredInterests = ["Technology", "Design"]; requiredSkills = ["Programming"]; salaryRange = "$65,000 - $110,000"; growthOutlook = "High" },
      { title = "Data Analyst"; description = "Analyzes data to inform business decisions."; requiredInterests = ["Technology", "Science"]; requiredSkills = ["Data Analysis", "Mathematics"]; salaryRange = "$65,000 - $100,000"; growthOutlook = "High" },
      { title = "UX/UI Designer"; description = "Designs user-friendly interfaces for digital products."; requiredInterests = ["Technology", "Design"]; requiredSkills = ["Design", "Critical Thinking"]; salaryRange = "$60,000 - $105,000"; growthOutlook = "High" },
      { title = "Cybersecurity Analyst"; description = "Protects systems and networks from digital attacks."; requiredInterests = ["Technology"]; requiredSkills = ["Critical Thinking", "Research"]; salaryRange = "$75,000 - $130,000"; growthOutlook = "High" },
      // Healthcare
      { title = "Nurse"; description = "Provides patient care in healthcare settings."; requiredInterests = ["Healthcare", "Science"]; requiredSkills = ["Critical Thinking", "Communication"]; salaryRange = "$60,000 - $90,000"; growthOutlook = "High" },
      { title = "Physical Therapist"; description = "Helps patients recover from injuries and improve mobility."; requiredInterests = ["Healthcare", "Sports"]; requiredSkills = ["Critical Thinking", "Communication"]; salaryRange = "$70,000 - $100,000"; growthOutlook = "High" },
      { title = "Medical Researcher"; description = "Conducts research to advance medicine and healthcare."; requiredInterests = ["Healthcare", "Science"]; requiredSkills = ["Research", "Data Analysis"]; salaryRange = "$75,000 - $125,000"; growthOutlook = "High" },
      // Finance
      { title = "Financial Analyst"; description = "Evaluates financial data and advises on investments."; requiredInterests = ["Finance", "Business"]; requiredSkills = ["Data Analysis", "Mathematics"]; salaryRange = "$65,000 - $110,000"; growthOutlook = "High" },
      { title = "Investment Banker"; description = "Manages large financial transactions and capital raising."; requiredInterests = ["Finance", "Business"]; requiredSkills = ["Mathematics", "Critical Thinking"]; salaryRange = "$90,000 - $180,000"; growthOutlook = "Stable" },
      { title = "Accountant"; description = "Manages financial records, audits, and tax reporting."; requiredInterests = ["Finance", "Business"]; requiredSkills = ["Mathematics", "Critical Thinking"]; salaryRange = "$60,000 - $100,000"; growthOutlook = "Stable" },
      { title = "Financial Planner"; description = "Helps individuals plan finances and long-term goals."; requiredInterests = ["Finance", "Business"]; requiredSkills = ["Communication", "Mathematics"]; salaryRange = "$55,000 - $95,000"; growthOutlook = "High" },
      // Law
      { title = "Lawyer"; description = "Represents clients in legal matters and provides legal advice."; requiredInterests = ["Law", "Business"]; requiredSkills = ["Critical Thinking", "Communication"]; salaryRange = "$80,000 - $200,000"; growthOutlook = "Stable" },
      { title = "Paralegal"; description = "Assists lawyers with research, documentation, and case prep."; requiredInterests = ["Law", "Business"]; requiredSkills = ["Research", "Communication"]; salaryRange = "$45,000 - $75,000"; growthOutlook = "Medium" },
      { title = "Compliance Officer"; description = "Ensures organizations follow laws and internal policies."; requiredInterests = ["Law", "Business"]; requiredSkills = ["Critical Thinking", "Communication"]; salaryRange = "$65,000 - $115,000"; growthOutlook = "High" },
      // Sports
      { title = "Sports Coach"; description = "Trains and guides athletes to improve performance."; requiredInterests = ["Sports", "Education"]; requiredSkills = ["Leadership", "Communication"]; salaryRange = "$40,000 - $85,000"; growthOutlook = "Medium" },
      { title = "Athletic Trainer"; description = "Prevents and treats sports injuries and supports athlete wellness."; requiredInterests = ["Sports", "Healthcare"]; requiredSkills = ["Critical Thinking", "Communication"]; salaryRange = "$45,000 - $75,000"; growthOutlook = "Medium" },
      { title = "Sports Analyst"; description = "Uses data to evaluate athlete and team performance."; requiredInterests = ["Sports", "Technology"]; requiredSkills = ["Data Analysis", "Research"]; salaryRange = "$50,000 - $90,000"; growthOutlook = "High" },
      // Environment
      { title = "Environmental Scientist"; description = "Studies the environment and develops solutions to environmental problems."; requiredInterests = ["Environment", "Science"]; requiredSkills = ["Research", "Data Analysis"]; salaryRange = "$55,000 - $95,000"; growthOutlook = "High" },
      { title = "Sustainability Manager"; description = "Develops strategies to reduce environmental impact in organizations."; requiredInterests = ["Environment", "Business"]; requiredSkills = ["Project Management", "Critical Thinking"]; salaryRange = "$60,000 - $105,000"; growthOutlook = "High" },
      { title = "Conservation Biologist"; description = "Studies and protects biodiversity and natural ecosystems."; requiredInterests = ["Environment", "Science"]; requiredSkills = ["Research", "Critical Thinking"]; salaryRange = "$50,000 - $85,000"; growthOutlook = "Medium" },
      // Media
      { title = "Journalist"; description = "Researches and reports on news and current events."; requiredInterests = ["Media", "Education"]; requiredSkills = ["Creative Writing", "Research"]; salaryRange = "$40,000 - $80,000"; growthOutlook = "Stable" },
      { title = "Content Creator"; description = "Produces written, video, or audio content for online platforms."; requiredInterests = ["Media", "Arts"]; requiredSkills = ["Creative Writing", "Communication"]; salaryRange = "$35,000 - $90,000"; growthOutlook = "High" },
      { title = "Video Producer"; description = "Plans, shoots, and edits video content for media and entertainment."; requiredInterests = ["Media", "Arts"]; requiredSkills = ["Creative Writing", "Project Management"]; salaryRange = "$50,000 - $95,000"; growthOutlook = "High" },
      { title = "Public Relations Specialist"; description = "Manages communication between organizations and the public."; requiredInterests = ["Media", "Marketing"]; requiredSkills = ["Communication", "Creative Writing"]; salaryRange = "$50,000 - $90,000"; growthOutlook = "Medium" },
      // Engineering
      { title = "Mechanical Engineer"; description = "Designs and develops mechanical systems and devices."; requiredInterests = ["Engineering", "Science"]; requiredSkills = ["Mathematics", "Critical Thinking"]; salaryRange = "$70,000 - $110,000"; growthOutlook = "Medium" },
      { title = "Civil Engineer"; description = "Designs and supervises construction of infrastructure projects."; requiredInterests = ["Engineering", "Environment"]; requiredSkills = ["Mathematics", "Project Management"]; salaryRange = "$70,000 - $115,000"; growthOutlook = "Medium" },
      { title = "Electrical Engineer"; description = "Designs electrical systems for a wide range of industries."; requiredInterests = ["Engineering", "Technology"]; requiredSkills = ["Mathematics", "Problem Solving"]; salaryRange = "$75,000 - $120,000"; growthOutlook = "High" },
      // Education
      { title = "Teacher"; description = "Educates students in various subjects at school level."; requiredInterests = ["Education", "Social Work"]; requiredSkills = ["Teaching", "Communication"]; salaryRange = "$50,000 - $75,000"; growthOutlook = "Medium" },
      { title = "Instructional Designer"; description = "Creates educational materials and curricula for learning programs."; requiredInterests = ["Education", "Technology"]; requiredSkills = ["Teaching", "Creative Writing"]; salaryRange = "$55,000 - $90,000"; growthOutlook = "High" },
      // Business & Marketing
      { title = "Project Manager"; description = "Leads teams to execute projects on time and within budget."; requiredInterests = ["Business", "Technology"]; requiredSkills = ["Leadership", "Project Management"]; salaryRange = "$80,000 - $130,000"; growthOutlook = "High" },
      { title = "Marketing Specialist"; description = "Develops and implements marketing strategies for products or services."; requiredInterests = ["Marketing", "Business"]; requiredSkills = ["Communication", "Creative Writing"]; salaryRange = "$55,000 - $95,000"; growthOutlook = "High" },
      { title = "Sales Representative"; description = "Identifies client needs and sells products to meet business goals."; requiredInterests = ["Business", "Marketing"]; requiredSkills = ["Sales", "Communication"]; salaryRange = "$45,000 - $95,000"; growthOutlook = "Stable" },
      { title = "Customer Success Manager"; description = "Builds relationships with clients to ensure satisfaction and retention."; requiredInterests = ["Business", "Social Work"]; requiredSkills = ["Customer Service", "Communication"]; salaryRange = "$55,000 - $100,000"; growthOutlook = "High" },
      // Arts & Design
      { title = "Graphic Designer"; description = "Creates visual concepts for marketing and branding."; requiredInterests = ["Arts", "Design"]; requiredSkills = ["Design", "Creative Writing"]; salaryRange = "$45,000 - $80,000"; growthOutlook = "Medium" },
      { title = "Animator"; description = "Creates animated content for film, games, and digital media."; requiredInterests = ["Arts", "Technology"]; requiredSkills = ["Design", "Critical Thinking"]; salaryRange = "$50,000 - $90,000"; growthOutlook = "Medium" },
      // Science
      { title = "Research Scientist"; description = "Designs and conducts experiments to advance scientific knowledge."; requiredInterests = ["Science", "Technology"]; requiredSkills = ["Research", "Data Analysis"]; salaryRange = "$70,000 - $120,000"; growthOutlook = "Stable" },
      { title = "Biotechnologist"; description = "Applies biological systems to develop products and technologies."; requiredInterests = ["Science", "Healthcare"]; requiredSkills = ["Research", "Critical Thinking"]; salaryRange = "$65,000 - $115,000"; growthOutlook = "High" },
      // Social Work
      { title = "Social Worker"; description = "Supports individuals and families facing challenges."; requiredInterests = ["Social Work", "Education"]; requiredSkills = ["Communication", "Teamwork"]; salaryRange = "$45,000 - $75,000"; growthOutlook = "Medium" },
      { title = "Counselor"; description = "Provides guidance to individuals dealing with personal or professional issues."; requiredInterests = ["Social Work", "Healthcare"]; requiredSkills = ["Communication", "Critical Thinking"]; salaryRange = "$50,000 - $80,000"; growthOutlook = "High" },
    ];
    for (job in jobList.values()) { jobs.add(job.title, job) };
  };

  public type CareerGuidanceResponse = { matches : [JobMatchResult]; response : Text };

  func countMatches(array1 : [Text], array2 : [Text]) : Nat {
    var count = 0;
    for (item1 in array1.values()) {
      if (array2.find(func(item2) { item2.toLower() == item1.toLower() }) != null) { count += 1 };
    };
    count;
  };

  func contains(text : Text, keyword : Text) : Bool {
    text.contains(#text keyword);
  };

  // Private helper: compute job matches for a principal without authorization check
  func computeMatchingJobsForPrincipal(p : Principal) : [JobMatchResult] {
    switch (users.get(p)) {
      case (null) { [] };
      case (?profile) {
        let matches = List.empty<JobMatchResult>();
        for ((_, job) in jobs.entries()) {
          let score = countMatches(profile.interests, job.requiredInterests) + countMatches(profile.skills, job.requiredSkills);
          if (score > 0) { matches.add({ job; score }) };
        };
        matches.toArray().sort();
      };
    };
  };

  // Generate a helpful, detailed AI response based on the user's message
  func generateCareerResponse(t : Text) : Text {
    if (contains(t, "hello") or contains(t, "hi ") or contains(t, "hey") or t == "hi") {
      "Hello! I'm your AI Career Advisor. I can help you with:\n\n- Exploring career paths by interest (tech, healthcare, finance, law, arts, and more)\n- Finding the best jobs that match your skills\n- Understanding salary ranges and job growth\n- Study and skill-building advice for students\n- Resume and interview tips\n- Choosing between careers\n\nJust tell me what you're interested in or ask any career question!"
    } else if (contains(t, "help") or contains(t, "what can you") or contains(t, "what do you")) {
      "I'm here to guide your career journey! Here's what I can help with:\n\n1. Career exploration - tell me your interests and I'll suggest careers\n2. Job matching - complete the assessment for personalized matches\n3. Salary & growth info - ask about any specific job or field\n4. Study tips - how to build skills for your target career\n5. Career comparisons - not sure between two paths? Ask me!\n6. Interview & resume advice\n\nTry asking: 'What careers suit someone who likes technology?' or 'How do I become a doctor?'"
    } else if (contains(t, "tech") or contains(t, "coding") or contains(t, "programming") or contains(t, "software") or contains(t, "ai") or contains(t, "artificial intelligence") or contains(t, "computer") or contains(t, "developer")) {
      "Technology is one of the fastest-growing fields today! Here are top career options:\n\n- Software Developer ($70k-$120k) - Build apps and systems. Learn Python, Java, or JavaScript to start.\n- Web Developer ($65k-$110k) - Create websites. HTML, CSS, and React are great starting points.\n- Data Analyst ($65k-$100k) - Turn data into insights using Excel, SQL, and Python.\n- Cybersecurity Analyst ($75k-$130k) - Protect systems from hackers. High demand, excellent pay.\n- UX/UI Designer ($60k-$105k) - Design user-friendly apps. Learn Figma and user research.\n- AI/ML Engineer ($100k-$180k) - Build intelligent systems using Python and machine learning frameworks.\n\nTip for students: Start with free resources like freeCodeCamp, Coursera, or Khan Academy. Build small projects to grow your portfolio!"
    } else if (contains(t, "health") or contains(t, "doctor") or contains(t, "medic") or contains(t, "nurs") or contains(t, "hospital") or contains(t, "pharma") or contains(t, "therapy")) {
      "Healthcare is a deeply rewarding field with strong job security. Here are top options:\n\n- Doctor/Physician ($200k-$350k) - Diagnose and treat patients. Requires medical school (8+ years).\n- Nurse ($60k-$90k) - Provide direct patient care. A nursing degree (2-4 years) gets you started fast.\n- Physical Therapist ($70k-$100k) - Help people recover from injuries. Growing demand for PTs.\n- Medical Researcher ($75k-$125k) - Advance science through experiments and clinical trials.\n- Pharmacist ($120k-$150k) - Dispense medications and advise on drug interactions.\n- Healthcare Administrator ($70k-$110k) - Manage hospitals and clinics without direct patient care.\n\nTip: Volunteer at a hospital or clinic to confirm your interest before committing to a long degree program!"
    } else if (contains(t, "financ") or contains(t, "money") or contains(t, "invest") or contains(t, "bank") or contains(t, "account") or contains(t, "econom")) {
      "Finance careers offer excellent earning potential. Here are the top paths:\n\n- Financial Analyst ($65k-$110k) - Analyze investments and advise companies. Get CFA certified for advancement.\n- Investment Banker ($90k-$180k) - Help companies raise capital. Very competitive but highly paid.\n- Accountant ($60k-$100k) - Manage financial records. CPA certification boosts your career significantly.\n- Financial Planner ($55k-$95k) - Help individuals plan for retirement and financial goals. CFP certification helps.\n- Economist ($85k-$130k) - Study market trends and advise governments and businesses.\n- Actuary ($100k-$160k) - Use math to assess financial risk. One of the highest-paying careers for math lovers!\n\nTip: Build Excel and data skills early. Internships at banks or financial firms are very valuable."
    } else if (contains(t, "law") or contains(t, "legal") or contains(t, "lawyer") or contains(t, "attorney") or contains(t, "justice") or contains(t, "court")) {
      "Law is a prestigious field with diverse career options. Here's what's available:\n\n- Lawyer/Attorney ($80k-$200k+) - Represent clients in court or provide legal advice. Requires law school (3 years after undergrad).\n- Paralegal ($45k-$75k) - Support lawyers with research and documents. Faster and more affordable entry point.\n- Compliance Officer ($65k-$115k) - Ensure companies follow regulations. High demand in banking and healthcare.\n- Judge - Hear and decide legal cases. Requires many years of legal experience.\n- Legal Consultant ($70k-$130k) - Advise businesses on legal matters without courtroom work.\n- Forensic Specialist - Apply science to law, working with law enforcement on investigations.\n\nTip: Strong writing and critical thinking skills are essential. Mock trial clubs and debate in school are great preparation!"
    } else if (contains(t, "engineer") or contains(t, "mechanical") or contains(t, "civil") or contains(t, "electrical") or contains(t, "chemical") or contains(t, "aerospace")) {
      "Engineering is a foundational field with excellent career stability. Top options:\n\n- Software Engineer ($90k-$150k) - The most in-demand engineering specialty today.\n- Mechanical Engineer ($70k-$110k) - Design machines, vehicles, and systems.\n- Civil Engineer ($70k-$115k) - Build roads, bridges, and infrastructure.\n- Electrical Engineer ($75k-$120k) - Design power systems, circuits, and electronics.\n- Chemical Engineer ($85k-$130k) - Work in manufacturing, pharmaceuticals, and energy.\n- Aerospace Engineer ($95k-$150k) - Design aircraft and spacecraft.\n\nAll engineering paths require a bachelor's degree. Strong math and physics foundations are essential. Internships during college are critical for landing good jobs after graduation!"
    } else if (contains(t, "art") or contains(t, "creat") or contains(t, "design") or contains(t, "music") or contains(t, "writ") or contains(t, "film") or contains(t, "animation")) {
      "Creative careers are thriving in the digital age! Here are the top paths:\n\n- Graphic Designer ($45k-$80k) - Create visual content for brands and marketing. Learn Figma, Illustrator, Photoshop.\n- UX/UI Designer ($60k-$105k) - Design how apps and websites feel to use. Very high demand in tech.\n- Animator ($50k-$90k) - Create animated content for games, films, and ads. Learn Blender, After Effects.\n- Content Creator ($35k-$90k+) - Build an audience on YouTube, TikTok, or podcasts. Unlimited earning potential.\n- Copywriter / Content Strategist ($50k-$90k) - Write compelling content for brands and websites.\n- Music Producer ($40k-$100k+) - Compose and produce music for media, games, or independent releases.\n\nTip: Build a strong portfolio! Your work samples matter more than your degree in most creative fields."
    } else if (contains(t, "sport") or contains(t, "fitness") or contains(t, "athlet") or contains(t, "coach") or contains(t, "exercise") or contains(t, "physical education")) {
      "Sports and fitness offer rewarding careers for active individuals:\n\n- Sports Coach ($40k-$85k) - Guide athletes at school, club, or professional levels.\n- Athletic Trainer ($45k-$75k) - Prevent and treat sports injuries. Great blend of health and sports.\n- Sports Analyst ($50k-$90k) - Use data to evaluate performance. Combines sports with technology.\n- Physical Therapist ($70k-$100k) - Help people recover from injuries. One of healthcare's best growth areas.\n- Personal Trainer ($35k-$80k) - Help clients achieve fitness goals. Low barrier to entry with certifications.\n- Sports Marketing Manager ($55k-$100k) - Promote teams, athletes, and sporting events.\n\nTip: Certifications like CSCS, CPT, or ATC can fast-track your sports career without a lengthy degree!"
    } else if (contains(t, "teach") or contains(t, "education") or contains(t, "professor") or contains(t, "school") or contains(t, "tutor")) {
      "Education careers are among the most impactful you can choose:\n\n- Teacher ($50k-$75k) - Shape the next generation. Primary, secondary, or higher education.\n- University Professor ($75k-$150k) - Teach and conduct research at college level. Requires PhD.\n- Instructional Designer ($55k-$90k) - Create online courses and learning programs. Growing with e-learning.\n- School Counselor ($50k-$80k) - Support students' academic and emotional wellbeing.\n- Corporate Trainer ($55k-$95k) - Train employees within companies. Great for those who like business.\n- Educational Technologist ($60k-$100k) - Integrate technology into learning environments.\n\nTip: Teaching experience gained through tutoring, camps, or volunteering looks great on applications and confirms it's the right path!"
    } else if (contains(t, "environment") or contains(t, "climate") or contains(t, "sustainab") or contains(t, "nature") or contains(t, "ecology") or contains(t, "green")) {
      "Environmental careers are more important than ever as the world tackles climate change:\n\n- Environmental Scientist ($55k-$95k) - Study environmental problems and develop solutions.\n- Sustainability Manager ($60k-$105k) - Help organizations reduce their environmental footprint. Fastest growing!\n- Conservation Biologist ($50k-$85k) - Protect ecosystems and endangered species.\n- Renewable Energy Engineer ($75k-$120k) - Design solar, wind, and other clean energy systems.\n- Climate Policy Analyst ($60k-$100k) - Work with governments on climate legislation and policy.\n- Environmental Lawyer ($80k-$150k) - Litigate environmental cases and advise on regulations.\n\nTip: Internships with NGOs, government agencies like EPA, or green companies give you a huge advantage."
    } else if (contains(t, "market") or contains(t, "advertis") or contains(t, "brand") or contains(t, "social media") or contains(t, "digital") or contains(t, "seo")) {
      "Marketing is a dynamic field that blends creativity with data. Top careers:\n\n- Digital Marketing Specialist ($55k-$90k) - Run online campaigns across Google, social media, and email.\n- Brand Manager ($70k-$120k) - Develop and manage a company's brand identity and strategy.\n- SEO/SEM Specialist ($55k-$90k) - Optimize websites to rank higher and attract more visitors.\n- Social Media Manager ($45k-$80k) - Build and engage audiences on platforms like Instagram and LinkedIn.\n- Content Strategist ($55k-$90k) - Plan content that attracts and converts customers.\n- Market Research Analyst ($60k-$95k) - Study consumer trends to guide business decisions.\n\nTip: Build your own social media presence or website as a portfolio. Certifications from Google, HubSpot, or Meta are free and valuable!"
    } else if (contains(t, "business") or contains(t, "entrepreneur") or contains(t, "startup") or contains(t, "management") or contains(t, "mba")) {
      "Business careers offer wide-ranging opportunities across every industry:\n\n- Project Manager ($80k-$130k) - Lead teams and deliver projects. PMP certification is highly valued.\n- Business Analyst ($70k-$110k) - Bridge business and technology to solve problems.\n- Management Consultant ($90k-$160k) - Advise companies on strategy and operations.\n- Entrepreneur - Build your own business. No salary limit, but requires vision and resilience.\n- Operations Manager ($70k-$120k) - Oversee day-to-day business functions.\n- Sales Director ($90k-$160k+) - Lead sales teams and drive revenue growth.\n\nTip: Gain experience through internships, side projects, or student business clubs. An MBA can accelerate advancement significantly."
    } else if (contains(t, "science") or contains(t, "research") or contains(t, "biology") or contains(t, "chemist") or contains(t, "physics") or contains(t, "lab")) {
      "Science careers drive innovation and discovery. Here are the key paths:\n\n- Research Scientist ($70k-$120k) - Conduct experiments to advance knowledge. PhD often needed for senior roles.\n- Biotechnologist ($65k-$115k) - Develop products from biological systems, especially in pharma.\n- Data Scientist ($90k-$150k) - One of the hottest careers, using statistics and AI on large datasets.\n- Chemical Engineer ($85k-$130k) - Apply chemistry to create products and industrial processes.\n- Forensic Scientist ($50k-$90k) - Use science to support criminal investigations.\n- Physicist ($80k-$150k) - Work in academia, research labs, or applied fields like energy and defense.\n\nTip: Undergraduate research opportunities and science competitions (like Olympiads) are a great way to stand out!"
    } else if (contains(t, "media") or contains(t, "journal") or contains(t, "communication") or contains(t, "broadcast") or contains(t, "reporter") or contains(t, "news")) {
      "Media and communications careers are evolving fast. Here are top options:\n\n- Journalist ($40k-$80k) - Report on news for newspapers, TV, online platforms.\n- Content Creator ($35k-$90k+) - Build a media presence through YouTube, TikTok, podcasts.\n- Video Producer ($50k-$95k) - Create video content for companies, films, or online channels.\n- Public Relations Specialist ($50k-$90k) - Manage how organizations communicate with the public.\n- Communications Manager ($65k-$110k) - Lead internal and external communication strategy.\n- Podcast Producer ($45k-$80k) - Create and edit audio content for growing podcast industry.\n\nTip: Start a blog, YouTube channel, or podcast now. Real-world content is your portfolio!"
    } else if (contains(t, "social") or contains(t, "psycholog") or contains(t, "counsel") or contains(t, "nonprofit") or contains(t, "human") or contains(t, "welfare")) {
      "Social and human services careers make a real difference in people's lives:\n\n- Social Worker ($45k-$75k) - Support families, children, and vulnerable individuals. MSW degree opens more doors.\n- Counselor / Therapist ($50k-$90k) - Provide mental health support. Growing demand for mental health services.\n- Psychologist ($85k-$130k) - Assess and treat mental health conditions. Doctoral degree required for clinical practice.\n- Non-Profit Manager ($50k-$90k) - Lead organizations working on social causes.\n- Human Resources Manager ($70k-$120k) - Support employees and company culture. Blends business and people skills.\n- Community Outreach Coordinator ($40k-$70k) - Connect communities with resources and programs.\n\nTip: Volunteering with social organizations while studying is practically essential for these careers."
    } else if (contains(t, "student") or contains(t, "study") or contains(t, "college") or contains(t, "university") or contains(t, "major") or contains(t, "degree") or contains(t, "what should i")) {
      "Great question! Here's my advice for students building their career foundation:\n\n1. Explore broadly - Don't rush to commit. Try different subjects, clubs, and internships.\n2. Build skills, not just grades - Communication, coding basics, data literacy, and leadership matter in every field.\n3. Complete the CareerPath AI Assessment - It analyzes your interests, skills, and personality to suggest personalized job matches!\n4. Internships are gold - Even one summer internship transforms your resume and clarifies your direction.\n5. Network early - Connect with professionals on LinkedIn. Informational interviews are free and invaluable.\n6. In-demand fields right now: Technology (AI/software), Healthcare, Renewable Energy, Cybersecurity, and Data Science.\n\nWhat are you most curious about? Tell me your interests and I'll suggest specific careers that might be a great fit!"
    } else if (contains(t, "scholarship") or contains(t, "financial aid") or contains(t, "grant") or contains(t, "bursary") or contains(t, "fee") or contains(t, "afford college") or contains(t, "afford university")) {
      "Funding your education is important. Here's how to find scholarships and financial aid:\n\nTypes of Funding:\n- Merit scholarships - Based on academic, athletic, or artistic achievement\n- Need-based grants - Based on financial situation. Fill out FAFSA (US) or your country's equivalent.\n- Field-specific scholarships - Many professional bodies offer scholarships for students entering their field\n- Employer-sponsored - Some companies fund degrees in exchange for work commitments\n\nWhere to Search:\n- Fastweb.com, Scholarships.com, College Board's Scholarship Search\n- Your target university's financial aid office\n- Local community foundations and civic organizations\n- Professional associations in your career field\n\nTips:\n- Apply early and apply widely. Many scholarships go unclaimed each year!\n- Write strong personal statements that clearly connect your goals to the award criteria.\n- Keep a spreadsheet tracking deadlines and requirements for every application.\n\nWould you like advice on a specific field's funding opportunities?"
    } else if (contains(t, "internship") or contains(t, "work experience") or contains(t, "placement") or contains(t, "apprentice") or contains(t, "volunteer")) {
      "Internships are one of the most powerful career moves you can make as a student:\n\nWhy Internships Matter:\n- Confirms (or changes) your career direction before you commit\n- Gives you real experience that separates you from other graduates\n- Builds your professional network from day one\n- Often leads directly to full-time job offers (60-70% of interns receive offers)\n\nHow to Get an Internship:\n1. Start your university's career center - they have exclusive listings and can review your resume\n2. LinkedIn Jobs and Indeed both have strong internship filters\n3. Cold email professionals you admire - a genuine, short email goes a long way\n4. Attend career fairs on and off campus\n5. Reach out to alumni from your school in your target field\n\nWhat to Expect:\n- Paid internships are standard in tech, finance, and engineering. Unpaid is more common in media and nonprofits.\n- Even a short 6-8 week placement builds your confidence and adds real weight to your resume.\n\nWhat field are you hoping to intern in? I can give more targeted advice!"
    } else if (contains(t, "exam") or contains(t, "assignment") or contains(t, "grade") or contains(t, "gpa") or contains(t, "academic") or contains(t, "pass") or contains(t, "fail") or contains(t, "test")) {
      "Academic performance matters, but it's not everything. Here's how to balance grades with career preparation:\n\nImproving Your Grades:\n- Active recall beats passive reading every time. Test yourself without looking at notes.\n- Study in shorter focused sessions (25-45 min) rather than marathon sessions.\n- Form study groups - explaining concepts to others solidifies your own understanding.\n- Use past papers as your main revision tool - it's the closest simulation of the real exam.\n- Visit your professors or tutors during office hours. Most are happy to help.\n\nGrades vs. Skills:\n- A 3.5 GPA with real project experience beats a 4.0 with no practical skills in most industries.\n- Technology, entrepreneurship, and creative fields care much more about your portfolio than your transcript.\n- Finance, law, and medicine are more grade-sensitive - target above 3.5 if you're heading that way.\n\nIf You're Struggling:\n- Speak to your academic advisor early - there are usually options to retake or resit.\n- Most universities have free tutoring and counseling services. Use them!\n- A bad semester doesn't define you. Many successful people had rough academic patches.\n\nWould you like study tips for a specific subject area?"
    } else if (contains(t, "stress") or contains(t, "anxiet") or contains(t, "overwhelm") or contains(t, "burnout") or contains(t, "mental health") or contains(t, "pressure") or contains(t, "worried")) {
      "It's completely normal to feel stressed or overwhelmed, especially as a student navigating your future. Here are some ways to manage it:\n\nImmediate Relief:\n- Take a real break - step outside for even 10 minutes. Fresh air resets your perspective.\n- The 5-4-3-2-1 grounding technique: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.\n- Talk to someone you trust. Sharing the load reduces it.\n\nLonger-Term Habits:\n- Regular exercise is the most evidence-backed mood booster. Even a 20-minute walk counts.\n- Protect your sleep. 7-9 hours is not optional for a functioning mind.\n- Break big tasks into smaller steps. Overwhelm usually comes from not knowing where to start.\n- Write down your worries. Getting them out of your head and onto paper creates distance.\n\nAcademic Support:\n- Most universities offer free counseling services. There is absolutely no stigma in using them.\n- Talk to your professor or advisor if academic pressure is the source - extensions are often possible.\n\nRemember: Career anxiety is very common. You don't have to have everything figured out right now. Take it one step at a time. I'm here to help you explore your options at your own pace."
    } else if (contains(t, "salary") or contains(t, "how much") or contains(t, "pay") or contains(t, "earn") or contains(t, "income") or contains(t, "wage")) {
      "Here are the highest-paying career paths across different fields:\n\n- Technology: Software Engineer ($90k-$150k), AI Engineer ($100k-$180k), Cybersecurity ($75k-$130k)\n- Healthcare: Physician ($200k-$350k), Pharmacist ($120k-$150k), Physical Therapist ($70k-$100k)\n- Finance: Investment Banker ($90k-$180k), Actuary ($100k-$160k), Financial Analyst ($65k-$110k)\n- Law: Senior Lawyer ($80k-$200k+), Compliance Officer ($65k-$115k)\n- Engineering: Aerospace Engineer ($95k-$150k), Chemical Engineer ($85k-$130k)\n- Business: Management Consultant ($90k-$160k), Project Manager ($80k-$130k)\n\nTip: Salaries vary by location, experience, and company. Major cities generally pay 20-40% more. Specialization and certifications increase earnings significantly. Complete the assessment to see jobs matched to your specific profile!"
    } else if (contains(t, "resume") or contains(t, "interview") or contains(t, "job search") or contains(t, "apply") or contains(t, "cv") or contains(t, "hire") or contains(t, "hired")) {
      "Here are key tips to stand out in your job search:\n\nResume Tips:\n- Keep it to 1 page (2 for senior roles). Use clean, readable formatting.\n- Lead with a strong summary and quantify achievements ('Increased sales by 30%' not 'Helped with sales')\n- Tailor your resume keywords to match each job description (ATS systems scan for this!)\n\nInterview Tips:\n- Research the company thoroughly before any interview. Know their mission, products, and recent news.\n- Use the STAR method for behavioral questions: Situation, Task, Action, Result\n- Prepare 3-5 questions to ask the interviewer -- it shows genuine interest\n- Practice out loud, not just in your head\n\nJob Search:\n- LinkedIn, Indeed, and Glassdoor are the top platforms\n- Referrals from your network fill ~70% of jobs -- start connecting!\n- Apply consistently: 5-10 quality applications per week beats 50 generic ones\n\nWant specific advice for your target role? Tell me what you're applying for!"
    } else if (contains(t, "skill") or contains(t, "learn") or contains(t, "improv") or contains(t, "develop") or contains(t, "grow") or contains(t, "course") or contains(t, "certif")) {
      "Here are the most valuable skills to build in 2024 and beyond:\n\nTechnical Skills:\n- Programming (Python is the most versatile starter language)\n- Data analysis (Excel + SQL + Python basics)\n- Digital marketing fundamentals\n- Graphic design basics (Canva or Figma)\n\nSoft Skills (equally important):\n- Clear, confident communication\n- Problem-solving and critical thinking\n- Project management and organization\n- Teamwork and collaboration\n\nFree Learning Resources:\n- Coursera, edX, and Khan Academy for structured learning\n- YouTube for practical tutorials on almost anything\n- LinkedIn Learning for professional development\n- Google, HubSpot, and Meta offer free certifications\n\nFor students: Build actual projects with what you learn. A GitHub portfolio or a real project impresses employers far more than a certificate alone!"
    } else if (contains(t, "assessment") or contains(t, "suggest") or contains(t, "recommend") or contains(t, "which career") or contains(t, "what career") or contains(t, "best career")) {
      "To give you truly personalized career recommendations, I'd suggest completing the CareerPath AI Assessment!\n\nThe assessment takes just a few minutes and asks about:\n- Your interests (technology, arts, science, etc.)\n- Your skills (communication, data, leadership, etc.)\n- Your personality traits (introverted/extroverted, detail-oriented, etc.)\n- Your preferred work style (remote, collaborative, independent, etc.)\n\nOnce complete, you'll get a ranked list of career matches tailored specifically to you, with salary ranges and growth outlooks.\n\nYou can find the Assessment in the sidebar. Meanwhile, tell me what subjects or activities you enjoy most and I can start suggesting career directions right now!"
    } else if (contains(t, "future") or contains(t, "trend") or contains(t, "growing") or contains(t, "best field") or contains(t, "in demand") or contains(t, "hot career")) {
      "Here are the fastest-growing career fields for the next 10 years:\n\n1. Artificial Intelligence & Machine Learning - Explosive demand, very high salaries. Learn Python and math foundations now.\n2. Cybersecurity - Every organization needs security experts. Massive shortage of qualified professionals.\n3. Healthcare & Mental Health - Aging population means growing demand for all medical professionals.\n4. Renewable Energy - Solar, wind, and battery technology are creating entirely new career categories.\n5. Data Science & Analytics - Companies are drowning in data and need people who can make sense of it.\n6. Sustainability & ESG - Companies are required to report on environmental impact, creating new roles.\n7. UX/Product Design - Every digital product needs designers who understand user needs.\n\nThe best strategy: Build strong foundational skills (communication, data literacy, coding basics) that work across multiple growing fields. Then specialize as you learn more about your interests!"
    } else {
      "Thanks for your message! I'm here to guide you on your career journey. Here are some things you can ask me:\n\n- 'What careers suit someone who likes technology?'\n- 'What's the salary for a data analyst?'\n- 'How do I become a doctor?'\n- 'What skills should I build as a student?'\n- 'Which are the fastest-growing careers right now?'\n- 'How do I prepare for a job interview?'\n- 'What's the best career for someone creative?'\n- 'How do I find scholarships?'\n- 'How do I get an internship?'\n\nYou can also complete the Assessment (in the sidebar) to get personalized job recommendations based on your interests and skills. What would you like to explore?"
    }
  };

  // Register a new account with credentials
  public shared ({ caller }) func registerAccount(username : Text, email : Text, passwordHash : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (credentials.containsKey(email)) { Runtime.trap("Email already registered") };
    credentials.add(email, { username; email; passwordHash });
  };

  // Validate login credentials
  public shared ({ caller }) func validateLogin(email : Text, passwordHash : Text) : async UserCredential {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    switch (credentials.get(email)) {
      case (null) { Runtime.trap("Invalid email or password") };
      case (?cred) {
        if (cred.passwordHash != passwordHash) { Runtime.trap("Invalid email or password") };
        cred
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    users.add(caller, profile);
  };

  public shared ({ caller }) func createUserProfile(name : Text, role : UserRole, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (users.containsKey(caller)) { Runtime.trap("User already exists") };
    users.add(caller, { name; role; bio; interests = []; skills = []; personalityTraits = []; workStylePreferences = [] });
  };

  public shared ({ caller }) func updateUserProfile(interests : [Text], skills : [Text], personalityTraits : [Text], workStylePreferences : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { users.add(caller, { profile with interests; skills; personalityTraits; workStylePreferences }) };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
    switch (users.get(user)) { case (null) { Runtime.trap("User not found") }; case (?p) { p } };
  };

  public shared ({ caller }) func addJob(job : Job) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
    jobs.add(job.title, job);
  };

  public query ({ caller }) func getJobList() : async [Job] { jobs.values().toArray().sort() };

  public query ({ caller }) func getJob(title : Text) : async Job {
    switch (jobs.get(title)) { case (null) { Runtime.trap("Job not found") }; case (?j) { j } };
  };

  public shared ({ caller }) func getMatchingJobs() : async [JobMatchResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    computeMatchingJobsForPrincipal(caller);
  };

  public shared ({ caller }) func addMessage(message : Message) : async CareerGuidanceResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let history = switch (conversations.get(caller)) { case (null) { [] }; case (?m) { m } };
    let newHistory = history.concat([message]);
    conversations.add(caller, newHistory);
    let t = message.content.toLower();
    let responseContent = generateCareerResponse(t);
    let aiResponse : Message = { role = "ai"; content = responseContent };
    conversations.add(caller, newHistory.concat([aiResponse]));
    let matches = computeMatchingJobsForPrincipal(caller);
    { matches; response = responseContent };
  };

  public query ({ caller }) func getConversationHistory() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    switch (conversations.get(caller)) { case (null) { [] }; case (?m) { m } };
  };

  public shared ({ caller }) func seedJobs() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) { Runtime.trap("Unauthorized") };
    for ((_, job) in jobs.entries()) { jobs.add(job.title, job) };
  };
};
