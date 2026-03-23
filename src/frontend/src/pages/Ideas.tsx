import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Lightbulb, Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME =
  "Hi! I'm your student AI assistant. I can help you with career advice, project ideas, study tips, scholarship info, exam prep, business ideas, coding, mental health, and much more. No login needed — just ask anything!";

const CHIPS = [
  "What career suits me?",
  "Give me project ideas",
  "Study tips for exams",
  "How to find scholarships?",
  "Business ideas for students",
  "Best coding languages",
  "How to get an internship?",
  "How to manage stress?",
  "How to make money as a student?",
  "What skills should I build?",
  "Tips for job interviews",
  "Future career trends",
];

function generateResponse(input: string): string {
  const q = input.toLowerCase();

  // Greetings
  if (
    /\b(hello|hi|hey|good morning|good afternoon|good evening|start|sup|what's up|howdy)\b/.test(
      q,
    )
  ) {
    return "Hey there! Great to have you here. I can help you with all of this:\n\n**Career & Jobs**\n- Career path exploration\n- Job interview tips\n- Resume and CV advice\n- Internship guidance\n- Salary information\n\n**Student Life**\n- Project ideas (coding, research, creative)\n- Study strategies and exam tips\n- Scholarship and funding info\n- Managing stress and burnout\n- Making money as a student\n\n**Skills & Growth**\n- Coding and tech skills\n- Business and entrepreneurship\n- Creative hobbies and side projects\n- Skill-building resources\n\nJust type your question or tap a chip below to get started!";
  }

  // Career guidance
  if (
    /career|job|profession|what should i be|what should i study|what can i do with/.test(
      q,
    )
  ) {
    return "Finding the right career path is all about matching your interests, skills, and values. Here's how to think about it:\n\n**Step 1: Self-Discovery**\n- What subjects energize you vs. drain you?\n- What problems do you enjoy solving?\n- Do you prefer working with people, data, or things?\n\n**Step 2: Explore High-Growth Fields**\n- **Technology** (AI, software, cybersecurity) — Highest demand, top salaries\n- **Healthcare** (nursing, medicine, therapy) — Stable, meaningful, always needed\n- **Data Science** — Every industry needs data analysts\n- **Renewable Energy** — The career field of the future\n- **Creative Tech** (UX design, animation) — Creativity meets technology\n- **Finance** (banking, investment, accounting) — Strong earning potential\n- **Law** — Prestigious, high impact, high pay\n- **Education** — Deeply rewarding and always in demand\n\n**Step 3: Take Action**\n- Try the CareerPath AI Assessment in the app for personalized matches\n- Do short internships or job shadowing to test your interest\n- Talk to professionals on LinkedIn — informational interviews are free and eye-opening\n\nWhat subjects or activities do you enjoy most? Tell me and I'll suggest specific careers for you!";
  }

  // Project ideas
  if (/project/.test(q)) {
    return "Here are **project ideas** organized by category:\n\n**Tech & Coding**\n1. **Budget tracker app** — Track spending with React or Flutter\n2. **Habit tracker** — Log daily habits and visualize streaks\n3. **Community platform** — A site for your school or hobby group\n4. **Automation script** — Auto-organize files or scrape data with Python\n5. **AI chatbot** — Build a simple chatbot using free APIs\n6. **Weather dashboard** — Pull live data from a free weather API\n\n**Data & Research**\n7. **Data analysis project** — Use public datasets (sports, climate, health)\n8. **Survey and findings report** — Research a topic and present insights\n\n**Social Impact**\n9. **Volunteer coordination app** — Help NGOs manage volunteers\n10. **Mental health awareness blog** — Share resources and stories\n11. **Local business directory** — Help small businesses get discovered\n\n**Creative**\n12. **Short film or documentary** — Pick an issue you care about\n13. **Digital art portfolio** — Create using Procreate or Figma\n14. **Podcast series** — Interview students or professionals in your field\n\nPick the one that excites you most and start small. Even a rough first version teaches you more than planning!";
  }

  // Study tips / exams
  if (
    /study|exam|revision|focus|concentrat|memoriz|note|revision|learn faster|remember/.test(
      q,
    )
  ) {
    return "**Study strategies that actually work:**\n\n**Proven Techniques**\n1. **Active Recall** — Close your notes and test yourself. Far more effective than rereading.\n2. **Spaced Repetition** — Review after 1 day, 3 days, 1 week, then 2 weeks. Use Anki (free app).\n3. **Pomodoro Method** — 25 min focused work + 5 min break. Repeat 4 times, then a longer break.\n4. **Feynman Technique** — Explain the concept as if teaching a 10-year-old. Gaps become obvious fast.\n5. **Mind Mapping** — Visualize how topics connect. Ideal for complex, interconnected subjects.\n\n**Before the Exam**\n6. Do past papers under timed conditions — the closest simulation of the real thing\n7. Create a one-page summary of each topic. Forces you to extract what matters most.\n8. Study with a friend and quiz each other out loud.\n\n**Habits That Help**\n9. **Sleep is non-negotiable** — Memory consolidates during sleep. A rested brain outperforms an all-nighter every time.\n10. **Exercise before studying** — Even a 20-minute walk significantly boosts focus and retention.\n11. **Remove distractions** — Phone in another room. Use Forest app or website blockers.\n\nWould you like tips for a specific subject like math, science, or writing?";
  }

  // Scholarship / financial aid
  if (
    /scholarship|financial aid|grant|bursary|fund|afford|tuition|fee/.test(q)
  ) {
    return "**Finding scholarships and funding your education:**\n\n**Types of Funding**\n- **Merit scholarships** — Based on academic, athletic, or artistic achievement\n- **Need-based grants** — Based on financial situation. Fill FAFSA (US) or your country's equivalent\n- **Field-specific scholarships** — Professional associations often fund students entering their field\n- **Employer-sponsored** — Some companies fund degrees in exchange for work commitments\n- **Government bursaries** — Many governments offer grants for specific subjects (STEM, teaching, etc.)\n\n**Where to Search**\n- Fastweb.com and Scholarships.com — large searchable databases\n- Your target university's financial aid office\n- Local community foundations and civic organizations\n- Professional associations in your career field\n- LinkedIn scholarship announcements\n\n**Tips for Winning Scholarships**\n- Apply early and apply widely. Many scholarships go unclaimed each year!\n- Write personal statements that specifically connect your story to the award criteria\n- Keep a spreadsheet tracking every deadline and requirement\n- Ask teachers or professors for strong, specific recommendation letters\n\nWould you like advice on scholarships for a specific field or country?";
  }

  // Internship / work experience
  if (
    /internship|work experience|placement|apprentice|volunteer|job shadow/.test(
      q,
    )
  ) {
    return "**How to land an internship as a student:**\n\n**Why Internships Matter**\n- Confirms your career direction before you commit years to it\n- Real experience that sets you apart from other graduates\n- Builds your professional network from the start\n- 60-70% of interns receive full-time job offers\n\n**How to Find One**\n1. **University career center** — Exclusive listings + free resume review\n2. **LinkedIn Jobs and Indeed** — Filter by 'Internship' and your field\n3. **Cold email professionals** — A short, genuine message gets more responses than you'd expect\n4. **Career fairs** — On and off campus. Bring printed resumes.\n5. **Alumni network** — Reach out to graduates from your school in your target field\n\n**How to Stand Out**\n- Tailor your resume to each application — don't send the same one everywhere\n- Show genuine interest: mention specific projects or values of the company\n- Follow up within 48 hours of any interview with a thank-you email\n\n**Unpaid vs Paid**\n- Paid is standard in tech, finance, and engineering\n- Unpaid is more common in media, nonprofits, and creative fields\n- Even a 6-week placement builds real confidence and a stronger resume\n\nWhat field are you hoping to intern in? I can give more targeted advice!";
  }

  // Resume / CV / interview
  if (
    /resume|cv|interview|cover letter|application|job search|apply|hiring|get hired/.test(
      q,
    )
  ) {
    return "**Standing out in your job search:**\n\n**Resume Tips**\n- Keep it to 1 page (2 for senior roles). Clean, readable formatting wins.\n- Start with a strong 2-3 sentence summary that positions you clearly\n- Quantify achievements: 'Increased event attendance by 40%' not 'Helped with events'\n- Tailor keywords to match each job description — ATS systems scan for this\n- List relevant projects, volunteering, and clubs if you have limited work experience\n\n**Cover Letter**\n- Address a real person if possible (LinkedIn can help you find the hiring manager)\n- Open with why you're genuinely excited about this company specifically\n- Connect 2-3 of your experiences directly to the job requirements\n- Keep it under one page\n\n**Interview Tips**\n- Research the company deeply before any interview: mission, products, recent news\n- Use the **STAR method** for behavioral questions: Situation, Task, Action, Result\n- Prepare 3-5 thoughtful questions to ask the interviewer\n- Practice your answers out loud — not just in your head\n- Send a thank-you email within 24 hours\n\n**Job Search Platforms**\n- LinkedIn, Indeed, Glassdoor — the top three\n- Referrals fill ~70% of jobs. Build your network!\n- 5-10 quality applications per week beats 50 generic ones\n\nWant specific advice for a particular role or industry?";
  }

  // Business ideas / entrepreneurship
  if (
    /business|startup|entrepreneur|side hustle|earn|sell|passive income/.test(q)
  ) {
    return "**Business and income ideas for students:**\n\n**Service-Based (Start immediately)**\n1. **Tutoring** — Teach subjects you're strong in. $20-50/hour, high demand, zero startup cost.\n2. **Freelance writing, design, or coding** — Use Fiverr, Upwork, or direct outreach.\n3. **Photography** — Events, portraits, or social media content for local businesses.\n4. **Social media management** — Help small businesses with Instagram, TikTok, and LinkedIn.\n5. **Virtual assistant** — Admin tasks, scheduling, research for busy professionals.\n\n**Product-Based**\n6. **Reselling** — Source at thrift stores or clearance, resell on eBay or Facebook Marketplace.\n7. **Digital products** — Templates, guides, presets. Create once, sell forever on Gumroad or Etsy.\n8. **Handmade goods** — Art, jewelry, or custom clothing on Etsy.\n\n**Content & Audience**\n9. **YouTube or TikTok channel** — Build an audience around your knowledge. Monetize over time.\n10. **Newsletter** — Consistent writing builds a loyal audience and sponsorship opportunities.\n11. **Online course** — Package your knowledge on Teachable or Gumroad.\n\n**Tip:** Start with services. It's the fastest path to real income with zero startup cost. Use the early cash to fund a product or content idea later.";
  }

  // Coding / programming / tech skills
  if (
    /cod|program|python|javascript|web dev|developer|software|tech skill|html|css|react|app/.test(
      q,
    )
  ) {
    return "**Getting started with coding — a complete student guide:**\n\n**Best First Languages (Pick One)**\n1. **Python** — Easiest syntax, works for AI, data, web, and automation. Start here for most paths.\n2. **JavaScript** — Powers every website. Essential for web apps and front-end development.\n3. **HTML + CSS** — Foundations of all web development. Learn these first if building websites.\n\n**Learning Paths by Goal**\n- Build websites → HTML → CSS → JavaScript → React\n- Data or AI → Python → Pandas → NumPy → Machine Learning\n- Mobile apps → React Native (JavaScript) or Flutter (Dart)\n- Cybersecurity → Networking → Linux → Python scripting\n- Game development → Unity (C#) or Godot (Python-like syntax)\n\n**Free Resources**\n- **freeCodeCamp.org** — Complete free curriculum with certificates\n- **CS50 by Harvard** — Best free intro to computer science ever made\n- **The Odin Project** — Hands-on, project-based web dev curriculum\n- **YouTube** — Tutorials for literally everything\n- **Codecademy** — Interactive beginner-friendly courses\n\n**Pro Tip:** Don't just watch tutorials. Build things. A calculator, to-do app, or personal website teaches 10x more. Push everything to GitHub — it becomes your portfolio.";
  }

  // Mental health / stress / overwhelmed
  if (
    /stress|anxiet|overwhelm|burnout|mental health|pressure|worried|depress|lonely|sad|tired|exhausted/.test(
      q,
    )
  ) {
    return "It's really normal to feel this way, especially as a student with a lot on your plate. Here's what can genuinely help:\n\n**Right Now**\n- Step away for 10 minutes. Even a short walk outside resets your nervous system.\n- Try the 5-4-3-2-1 method: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. It grounds you in the present.\n- Talk to someone you trust — sharing the load reduces it.\n\n**This Week**\n- Break big tasks into tiny steps. Overwhelm comes from not knowing where to start.\n- Write your worries on paper. Getting them out of your head creates useful distance.\n- Exercise — even a 20-minute walk. It's the most evidence-backed mood booster available.\n- Protect your sleep. 7-9 hours isn't optional for a functioning mind.\n\n**Longer Term**\n- Most universities offer **free counseling**. There is zero stigma in using it — it's one of the best resources available to you.\n- Talk to your academic advisor if pressure is coming from coursework — extensions and support options often exist.\n\nRemember: you don't need to have everything figured out right now. Career stress is universal. I'm here to help you think through it step by step, at your own pace.";
  }

  // Making money / income / finances
  if (/money|earn|income|pay|financ|afford|broke|budget|save|rich/.test(q)) {
    return "**Making and managing money as a student:**\n\n**Earn Money Now**\n1. **Tutoring** — Teach peers or younger students. $20-50/hour, no startup cost.\n2. **Freelancing** — Writing, design, or coding on Fiverr or Upwork.\n3. **Campus jobs** — Library, admin, student union. Convenient and flexible.\n4. **Delivery apps** — UberEats, DoorDash, TaskRabbit for flexible hours.\n5. **Sell things** — Declutter and sell on Facebook Marketplace or eBay.\n\n**Build Income Over Time**\n6. **Grow a skill and freelance** — 3 months of focused learning unlocks real income.\n7. **Content creation** — YouTube or TikTok. Takes time but can scale.\n8. **Digital products** — Templates, guides, presets. Create once, sell forever.\n\n**Manage Money Better**\n9. **Track your spending** — A simple spreadsheet changes behavior.\n10. **50/30/20 rule** — 50% needs, 30% wants, 20% savings.\n11. **Student discounts** — Use your ID everywhere: Spotify, Adobe, Adobe, Amazon Prime, transport.\n12. **Cook more meals** — Food is the largest controllable expense for most students.\n\nBuilding skills NOW is the best financial investment you can make as a student.";
  }

  // Skills to build
  if (
    /skill|improve|grow|develop|self|better|success|productiv|habit/.test(q)
  ) {
    return "**High-value skills to build as a student:**\n\n**Technical Skills (High ROI)**\n1. **Coding basics** — Even Python fundamentals opens doors in almost every industry\n2. **Data literacy** — Reading charts, understanding statistics, using spreadsheets\n3. **Digital marketing** — SEO, social media strategy, and content creation\n4. **Graphic design basics** — Canva or Figma. Visual communication matters everywhere.\n\n**Soft Skills (Equally Important)**\n5. **Public speaking** — Join debate club or Toastmasters. Rare and hugely valued.\n6. **Clear writing** — Emails, reports, pitches. Writing well sets you apart.\n7. **Critical thinking** — Question assumptions, evaluate evidence, reason clearly.\n8. **Time management** — Use the Eisenhower Matrix. Protect deep work time.\n\n**Networking**\n9. **LinkedIn profile** — Start now. Connect with professors, alumni, and professionals.\n10. **Attend events** — Hackathons, career fairs — relationships made there are real.\n\n**Mindset**\n11. **Learn in public** — Share projects and learning online. Builds reputation fast.\n12. **Embrace discomfort** — Skills with the highest payoff always feel hard to start.";
  }

  // Creative hobbies
  if (
    /creative|hobby|art|music|design|draw|paint|photo|film|animat|sport|fitness/.test(
      q,
    )
  ) {
    return "**Creative pursuits worth exploring:**\n\n**Visual Arts**\n1. **Digital illustration** — Procreate (iPad), Krita (free), or Adobe Fresco\n2. **Photography** — Your phone is enough. Learn composition and lighting first.\n3. **Graphic design** — Canva for beginners, Figma for professional work. Both free.\n4. **3D modeling** — Blender is free and used in games, film, and architecture.\n\n**Music & Audio**\n5. **Music production** — GarageBand (free iOS/Mac) or LMMS (free on all platforms)\n6. **Podcasting** — Record conversations on things you love. Very low barrier.\n\n**Writing & Storytelling**\n7. **Fiction writing** — Short stories or novels. NaNoWriMo is a great challenge.\n8. **Blogging or newsletters** — Share what you know and build an audience over time.\n9. **Game design** — Godot and Unity are free. Teaches logic and creativity together.\n\n**Sports & Fitness**\n10. **Try a new sport** — Rugby, swimming, martial arts, climbing. Community + fitness.\n11. **Home workout routine** — Consistency beats intensity. 20 minutes daily works.\n\nCreative skills often become careers or powerful differentiators in any field!";
  }

  // Salary / how much does a job pay
  if (/salary|how much|pay|wage|earning potential/.test(q)) {
    return "**Salary ranges across major career fields:**\n\n**Technology**\n- Software Engineer: $90k-$150k\n- AI/ML Engineer: $100k-$180k\n- Cybersecurity Analyst: $75k-$130k\n- Data Scientist: $90k-$150k\n\n**Healthcare**\n- Physician/Doctor: $200k-$350k\n- Pharmacist: $120k-$150k\n- Nurse: $60k-$90k\n- Physical Therapist: $70k-$100k\n\n**Finance**\n- Investment Banker: $90k-$180k\n- Actuary: $100k-$160k\n- Financial Analyst: $65k-$110k\n- Accountant: $60k-$100k\n\n**Law**\n- Lawyer: $80k-$200k+\n- Compliance Officer: $65k-$115k\n\n**Engineering**\n- Aerospace Engineer: $95k-$150k\n- Chemical Engineer: $85k-$130k\n- Civil Engineer: $70k-$115k\n\n**Business**\n- Management Consultant: $90k-$160k\n- Project Manager: $80k-$130k\n\nSalaries vary by location, experience, and company. Major cities pay 20-40% more. Specialization and certifications increase earnings significantly. Ask me about any specific role!";
  }

  // Future careers / trends
  if (/future|trend|growing|in demand|hot career|next 10 years/.test(q)) {
    return "**Fastest-growing career fields for the next decade:**\n\n1. **Artificial Intelligence & Machine Learning** — Explosive demand, very high salaries. Learn Python and math now.\n2. **Cybersecurity** — Every organization needs security experts. Massive talent shortage globally.\n3. **Healthcare & Mental Health** — Aging population = growing demand for all medical roles.\n4. **Renewable Energy** — Solar, wind, and battery tech are creating entirely new career categories.\n5. **Data Science & Analytics** — Companies have more data than they know what to do with.\n6. **Sustainability & ESG** — Companies must report environmental impact. New roles everywhere.\n7. **UX/Product Design** — Every digital product needs designers who understand users.\n8. **Biotech & Life Sciences** — Gene editing, drug discovery, and diagnostics are booming.\n\n**Best Strategy**\nBuild strong foundational skills (communication, data literacy, coding basics) that transfer across multiple growing fields. Then specialize as you learn what excites you most.\n\nWhat field interests you? I can tell you the specific roles and paths in that area!";
  }

  // Technology careers
  if (
    /tech|software|developer|cybersecurity|data science|artificial intelligence|cloud/.test(
      q,
    )
  ) {
    return "**Technology career paths:**\n\n- **Software Developer** ($70k-$120k) — Build apps and systems. Start with Python or JavaScript.\n- **Web Developer** ($65k-$110k) — Create websites. HTML, CSS, React are great starting points.\n- **Data Analyst** ($65k-$100k) — Turn data into decisions using Excel, SQL, and Python.\n- **Cybersecurity Analyst** ($75k-$130k) — Protect systems from hackers. Very high demand.\n- **UX/UI Designer** ($60k-$105k) — Design user-friendly digital products. Learn Figma.\n- **AI/ML Engineer** ($100k-$180k) — Build intelligent systems. Requires Python + math foundations.\n- **Cloud Engineer** ($90k-$140k) — Manage cloud infrastructure on AWS, Azure, or Google Cloud.\n\n**Getting Started**\n- freeCodeCamp, CS50 (Harvard), and The Odin Project are free and excellent\n- Build small real projects and put them on GitHub\n- Entry-level tech roles rarely require a CS degree — a strong portfolio matters more\n\nWhich technology path interests you most?";
  }

  // Healthcare careers
  if (/health|doctor|medic|nurs|hospital|pharma|therapy|surgeon/.test(q)) {
    return "**Healthcare career paths:**\n\n- **Doctor/Physician** ($200k-$350k) — Diagnose and treat patients. Requires medical school (8+ years total).\n- **Nurse** ($60k-$90k) — Direct patient care. A 2-4 year nursing degree gets you started fast.\n- **Physical Therapist** ($70k-$100k) — Help people recover from injuries. Growing demand.\n- **Pharmacist** ($120k-$150k) — Dispense medications and advise on drug interactions.\n- **Medical Researcher** ($75k-$125k) — Run experiments to advance medicine.\n- **Healthcare Administrator** ($70k-$110k) — Manage hospitals and clinics without direct patient care.\n- **Mental Health Counselor** ($50k-$90k) — Provide therapy and support. Very high demand now.\n\n**For Students**\nVolunteer at a hospital or clinic first. Shadowing a professional for even a few days will confirm whether healthcare is the right path before committing to a long degree program.";
  }

  // General help / what can you do
  if (/help|what can you|what do you|how does this work|what topics/.test(q)) {
    return "I'm your student AI assistant — here's everything I can help you with:\n\n**Career & Jobs**\n- Career path exploration by interest\n- Job descriptions and salary ranges\n- Interview tips and resume advice\n- Internship guidance\n- Future career trends\n\n**Student Life**\n- Project ideas (tech, creative, research)\n- Study strategies and exam tips\n- Scholarship and financial aid info\n- Stress and mental health support\n- Making money as a student\n\n**Skills & Learning**\n- Coding and programming guidance\n- Skill-building recommendations\n- Free learning resources\n- Business and entrepreneurship ideas\n- Creative hobbies and side projects\n\nJust type your question in plain language — no need for perfect phrasing. I'll understand!";
  }

  // Fallback
  return "Great question! Let me point you in the right direction. Here are some popular topics I can help with:\n\n- **Career guidance** — 'What career suits someone who likes science?'\n- **Project ideas** — 'Give me coding project ideas'\n- **Study tips** — 'How do I study better for exams?'\n- **Scholarships** — 'How do I find scholarships?'\n- **Internships** — 'How do I get my first internship?'\n- **Business ideas** — 'Business ideas I can start as a student'\n- **Coding** — 'Best programming languages to learn first'\n- **Mental health** — 'How do I manage stress during exams?'\n- **Money** — 'How can I earn money as a student?'\n- **Skills** — 'What skills should I build for my future?'\n\nOr just describe your situation in your own words and I'll help from there!";
}

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, i) => {
      const k = `p-${lineIdx}-${i}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      return <span key={k}>{part}</span>;
    });
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: line content is stable by index
      <span key={`line-${lineIdx}`}>
        {rendered}
        {lineIdx < lines.length - 1 && "\n"}
      </span>
    );
  });
}

export default function Ideas() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (content: string) => {
    if (!content.trim() || isTyping) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsTyping(true);
    const delay = 700 + Math.random() * 600;
    setTimeout(() => {
      const response = generateResponse(content);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, delay);
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showChips = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-card flex-shrink-0">
        <div className="w-10 h-10 rounded-xl gradient-card flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold">Student AI Assistant</h2>
          <p className="text-xs text-muted-foreground">
            Career advice, ideas, study tips & more — no login required
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4 max-w-2xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                // biome-ignore lint/suspicious/noArrayIndexKey: message index
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
                data-ocid={`ideas.message.item.${i + 1}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full gradient-card flex items-center justify-center flex-shrink-0 mt-1">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] space-y-3",
                    msg.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm",
                    )}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Quick-start chips */}
          <AnimatePresence>
            {showChips && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-wrap gap-2 pl-11"
              >
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    data-ocid="ideas.tab"
                    onClick={() => sendMessage(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-3 justify-start"
                data-ocid="ideas.typing.loading_state"
              >
                <div className="w-8 h-8 rounded-full gradient-card flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-secondary">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.15,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 border-t bg-card px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            data-ocid="ideas.textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about careers, study tips, scholarships, projects, coding..."
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition min-h-[44px] max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <Button
            data-ocid="ideas.send.primary_button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 p-0 rounded-xl gradient-card text-white border-0 hover:opacity-90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
