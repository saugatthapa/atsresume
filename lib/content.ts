export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  audience: string;
  tips: string[];
  faq: { question: string; answer: string }[];
  priority: number;
  group: "tool" | "niche" | "blog" | "legal";
};

export const seoPages: SeoPage[] = [
  {
    slug: "/ats-resume-checker",
    title: "Free ATS Resume Checker for Job Descriptions | JobResumeMatch",
    description: "Use a free ATS resume checker to compare your resume with a job description and find missing keywords, matched skills, and resume fixes.",
    h1: "Free ATS Resume Checker for Job Descriptions",
    intro: "An ATS resume checker helps you understand whether your resume speaks the same language as the role you want. JobResumeMatch compares your resume with the exact posting, then highlights the terms and skills that are present, missing, or weakly supported.",
    audience: "Job seekers applying to competitive roles who want practical resume feedback before sending an application.",
    tips: ["Mirror important job title language when it is truthful.", "Add required tools and certifications in context, not as a keyword dump.", "Use simple section headings like Experience, Skills, and Education."],
    faq: [
      { question: "Is this ATS resume checker free?", answer: "Yes. You can run a free analysis and download a watermarked preview. Clean exports are available with a paid unlock." },
      { question: "Does a high score guarantee an interview?", answer: "No. The score is an estimate. Hiring decisions and ATS systems vary by employer." }
    ],
    priority: 0.9,
    group: "tool"
  },
  {
    slug: "/resume-match-score",
    title: "Resume Match Score Tool | Estimate Your ATS Fit",
    description: "Get an estimated resume match score for a job description with matched keywords, missing skills, and rewrite suggestions.",
    h1: "Resume Match Score Tool",
    intro: "A resume match score gives you a quick signal on how closely your resume aligns with a target job description. The most useful score is not just a number; it explains what matched, what is missing, and which bullets need stronger evidence.",
    audience: "Applicants comparing multiple roles or tailoring a resume before submitting it.",
    tips: ["Use the same resume version for one role at a time.", "Review missing terms before adding them; accuracy matters more than volume.", "Strengthen low-evidence bullets with metrics and outcomes."],
    faq: [
      { question: "What is a good resume match score?", answer: "A score above 80 is usually a strong signal, but the job market, recruiter judgment, and ATS configuration still matter." },
      { question: "How is the score calculated?", answer: "The MVP combines keyword overlap, skill coverage, role relevance, ATS formatting, and bullet strength." }
    ],
    priority: 0.9,
    group: "tool"
  },
  {
    slug: "/match-resume-to-job-description",
    title: "Match Resume to Job Description in Seconds",
    description: "Paste your resume and job description to find keyword gaps, matched skills, and job-tailored resume improvements.",
    h1: "Match Your Resume to a Job Description",
    intro: "Tailoring a resume starts with the job description. This tool compares the language of your experience with the employer's stated needs so you can make focused edits instead of guessing.",
    audience: "Job seekers who want one targeted resume for each important application.",
    tips: ["Start with must-have qualifications from the posting.", "Keep claims honest and backed by work you actually performed.", "Rewrite bullets to connect responsibilities with outcomes."],
    faq: [
      { question: "Should I tailor my resume for every job?", answer: "For important applications, yes. Even small wording and emphasis changes can make the resume easier to evaluate." },
      { question: "Can I paste any job description?", answer: "Yes, as long as it has enough detail for comparison." }
    ],
    priority: 0.9,
    group: "tool"
  },
  {
    slug: "/resume-keyword-scanner",
    title: "Resume Keyword Scanner for Job Applications",
    description: "Scan your resume for job description keywords and find missing terms that may matter to ATS and recruiters.",
    h1: "Resume Keyword Scanner",
    intro: "A resume keyword scanner is useful when it separates important role language from filler. JobResumeMatch looks for repeated requirements, tools, skills, and domain terms, then compares them against your resume.",
    audience: "Applicants who want a cleaner way to check keyword coverage without stuffing their resume.",
    tips: ["Prioritize required skills over nice-to-have language.", "Add keywords inside real accomplishments.", "Keep a concise skills section for tools and certifications."],
    faq: [
      { question: "Is keyword stuffing helpful?", answer: "No. It can make a resume look less credible. Use relevant keywords where they accurately fit." },
      { question: "Does this scan soft skills?", answer: "It can identify soft-skill language, but hard skills and role-specific terms tend to be more actionable." }
    ],
    priority: 0.9,
    group: "tool"
  },
  {
    slug: "/job-description-resume-checker",
    title: "Job Description Resume Checker | Compare Resume Fit",
    description: "Check your resume against a job description and see an estimated ATS match score, keyword gaps, and practical edits.",
    h1: "Job Description Resume Checker",
    intro: "A job description resume checker helps you move from generic resume edits to role-specific improvements. It shows where your resume already fits and where a recruiter may not see enough evidence.",
    audience: "Career switchers, active applicants, and professionals updating resumes for a specific opening.",
    tips: ["Compare one job at a time.", "Check both skills and responsibility language.", "Use the summary to bridge directly relevant experience."],
    faq: [
      { question: "Can this help career changers?", answer: "Yes. It can reveal transferable experience, but you should avoid claiming skills you do not have." },
      { question: "Are results private?", answer: "Result pages use private token URLs and are marked noindex." }
    ],
    priority: 0.9,
    group: "tool"
  },
  {
    slug: "/resume-optimizer",
    title: "Resume Optimizer for ATS and Recruiter Review",
    description: "Optimize your resume for a specific job with missing keywords, stronger bullets, and a job-tailored summary.",
    h1: "Resume Optimizer",
    intro: "A resume optimizer should do more than rearrange words. It should help you clarify evidence, surface relevant skills, and make the resume easier for both ATS software and humans to read.",
    audience: "Professionals who want a focused resume revision before applying.",
    tips: ["Improve the top third of your resume first.", "Use active verbs and measurable outcomes.", "Keep formatting simple for ATS parsing."],
    faq: [
      { question: "Will the tool rewrite my resume?", answer: "It provides targeted rewrite suggestions and a preview, while you remain responsible for final edits." },
      { question: "Can I download the optimized version?", answer: "Free downloads include a watermark. Paid unlock removes it." }
    ],
    priority: 0.9,
    group: "tool"
  },
  {
    slug: "/ats-resume-checker-for-software-engineers",
    title: "ATS Resume Checker for Software Engineers",
    description: "Check a software engineering resume for technical keywords, stack alignment, project evidence, and ATS readability.",
    h1: "ATS Resume Checker for Software Engineers",
    intro: "Software engineering resumes need to show stack fit, system impact, and product outcomes. This checker compares your resume against engineering job descriptions for frameworks, languages, architecture terms, and evidence of delivery.",
    audience: "Frontend, backend, full-stack, DevOps, and platform engineers.",
    tips: ["Name the technologies you used in context.", "Connect technical work to reliability, revenue, speed, or user outcomes.", "Avoid long tool lists with no project evidence."],
    faq: [
      { question: "Does this check programming languages?", answer: "Yes. It detects common languages, frameworks, and infrastructure terms from the job description." },
      { question: "Should I include every technology?", answer: "No. Include the ones you can discuss confidently." }
    ],
    priority: 0.8,
    group: "niche"
  },
  {
    slug: "/ats-resume-checker-for-data-analysts",
    title: "ATS Resume Checker for Data Analysts",
    description: "Compare a data analyst resume with a job description for SQL, dashboards, analytics tools, and business impact.",
    h1: "ATS Resume Checker for Data Analysts",
    intro: "Data analyst roles often mix tools, statistical thinking, stakeholder work, and business judgment. This checker helps you see whether your resume reflects the analysis language in the posting.",
    audience: "Data analysts, BI analysts, reporting analysts, and analytics candidates.",
    tips: ["Show SQL, dashboard, and data cleaning experience clearly.", "Tie analysis work to business decisions.", "Include domain context when relevant."],
    faq: [
      { question: "Can it find missing analytics tools?", answer: "Yes. It compares job tools like SQL, Tableau, Excel, Python, and Power BI against your resume." },
      { question: "Are metrics important?", answer: "They help recruiters understand scale and impact." }
    ],
    priority: 0.8,
    group: "niche"
  },
  {
    slug: "/ats-resume-checker-for-nurses",
    title: "ATS Resume Checker for Nurses",
    description: "Check a nursing resume for clinical keywords, certifications, patient care language, and job-specific requirements.",
    h1: "ATS Resume Checker for Nurses",
    intro: "Nursing resumes need clear clinical experience, credentials, patient care settings, and specialty language. JobResumeMatch helps compare your resume with a nursing job description before you apply.",
    audience: "RNs, LPNs, nurse practitioners, and clinical care professionals.",
    tips: ["List licenses and certifications accurately.", "Match unit, specialty, and patient population language.", "Keep patient outcomes and safety experience clear."],
    faq: [
      { question: "Can it check certifications?", answer: "It can flag certification terms that appear in the job description and whether they appear in your resume." },
      { question: "Should I add a missing certification?", answer: "Only if you actually hold it." }
    ],
    priority: 0.8,
    group: "niche"
  },
  {
    slug: "/ats-resume-checker-for-teachers",
    title: "ATS Resume Checker for Teachers",
    description: "Compare a teacher resume with school job descriptions for curriculum, classroom management, assessment, and certification keywords.",
    h1: "ATS Resume Checker for Teachers",
    intro: "Teaching resumes are strongest when they connect classroom practice with the needs of a specific school or district. This checker helps identify curriculum, grade-level, assessment, and certification language to consider.",
    audience: "Teachers, instructional coaches, tutors, and education professionals.",
    tips: ["Name grade levels and subject areas clearly.", "Include classroom management and assessment methods.", "Mention certifications exactly as required by the posting."],
    faq: [
      { question: "Can this help with district applications?", answer: "Yes. It can compare your resume to a specific school or district posting." },
      { question: "Does it replace a cover letter?", answer: "No. It helps tailor the resume; your cover letter can add context." }
    ],
    priority: 0.8,
    group: "niche"
  },
  {
    slug: "/ats-resume-checker-for-project-managers",
    title: "ATS Resume Checker for Project Managers",
    description: "Check a project manager resume for delivery methods, stakeholder language, certifications, tools, and impact.",
    h1: "ATS Resume Checker for Project Managers",
    intro: "Project manager postings often emphasize delivery methods, tools, stakeholder complexity, and measurable outcomes. This checker helps you align your resume with the role without losing credibility.",
    audience: "Project managers, program managers, scrum masters, and operations leaders.",
    tips: ["Include relevant methods like Agile, Scrum, Waterfall, or hybrid delivery.", "Show budget, timeline, and stakeholder scope.", "Make tool experience easy to find."],
    faq: [
      { question: "Does it check PMP or Scrum terms?", answer: "Yes. If the posting mentions those credentials, the checker can flag whether they appear in your resume." },
      { question: "Should every bullet have a metric?", answer: "Not every bullet, but metrics help show project scale and impact." }
    ],
    priority: 0.8,
    group: "niche"
  },
  {
    slug: "/ats-resume-checker-for-digital-marketers",
    title: "ATS Resume Checker for Digital Marketers",
    description: "Compare a digital marketing resume with job descriptions for SEO, paid media, analytics, content, and growth keywords.",
    h1: "ATS Resume Checker for Digital Marketers",
    intro: "Digital marketing roles can vary widely across SEO, paid media, lifecycle, content, analytics, and growth. This checker helps you tailor your resume to the exact channel mix in the job description.",
    audience: "SEO specialists, growth marketers, paid media managers, content marketers, and marketing analysts.",
    tips: ["Name platforms and channels accurately.", "Tie campaign work to qualified leads, revenue, conversion, or retention.", "Use analytics language when the posting asks for measurement."],
    faq: [
      { question: "Can it detect SEO and paid media terms?", answer: "Yes. It compares channel and platform language against your resume." },
      { question: "Should I include campaign results?", answer: "Yes, when you can share them honestly." }
    ],
    priority: 0.8,
    group: "niche"
  }
];

export const blogPages: SeoPage[] = [
  {
    slug: "/blog/how-to-match-resume-to-job-description",
    title: "How to Match Your Resume to a Job Description",
    description: "A practical guide to tailoring your resume to a job description without keyword stuffing or exaggerating experience.",
    h1: "How to Match Your Resume to a Job Description",
    intro: "Matching your resume to a job description means choosing the most relevant evidence from your background and making it easy to find. It is not about copying the posting or inflating skills.",
    audience: "Anyone preparing an application for a role they care about.",
    tips: ["Highlight must-have qualifications first.", "Rewrite bullets to show similar problems you solved.", "Compare terminology after the substance is accurate."],
    faq: [
      { question: "How long should tailoring take?", answer: "A focused pass can take 20 to 40 minutes once your base resume is strong." },
      { question: "Can I reuse tailored resumes?", answer: "Yes, for similar roles, but review each job description before applying." }
    ],
    priority: 0.7,
    group: "blog"
  },
  {
    slug: "/blog/ats-resume-keywords",
    title: "ATS Resume Keywords: What to Use and What to Avoid",
    description: "Learn how ATS resume keywords work, where to place them, and how to avoid spammy keyword stuffing.",
    h1: "ATS Resume Keywords",
    intro: "ATS resume keywords are the role-specific terms that help screening systems and recruiters understand your fit. The best keywords are accurate, specific, and supported by your experience.",
    audience: "Job seekers who want better keyword alignment without making their resume unnatural.",
    tips: ["Use exact tool names when requested.", "Include acronyms and spelled-out versions when space allows.", "Do not hide keywords or add skills you cannot defend."],
    faq: [
      { question: "Where should keywords go?", answer: "Use them in your summary, skills section, and experience bullets where they fit naturally." },
      { question: "Are keywords enough?", answer: "No. Strong evidence and readable formatting matter too." }
    ],
    priority: 0.7,
    group: "blog"
  },
  {
    slug: "/blog/why-your-resume-is-not-getting-interviews",
    title: "Why Your Resume Is Not Getting Interviews",
    description: "Common reasons resumes fail to get interviews, including weak targeting, vague bullets, missing keywords, and unclear impact.",
    h1: "Why Your Resume Is Not Getting Interviews",
    intro: "When a resume is not getting interviews, the issue is often a mix of targeting, clarity, evidence, and market fit. A resume checker can identify some of those issues, but your judgment still matters.",
    audience: "Applicants sending resumes without enough response.",
    tips: ["Compare your resume against actual postings.", "Replace vague responsibilities with outcomes.", "Make the most relevant experience visible in the first half of the page."],
    faq: [
      { question: "Is ATS always the problem?", answer: "No. ATS fit is one factor. Competition, timing, referrals, and experience level also matter." },
      { question: "What should I fix first?", answer: "Start with role alignment and bullet clarity before visual formatting." }
    ],
    priority: 0.7,
    group: "blog"
  },
  {
    slug: "/blog/how-to-improve-ats-score",
    title: "How to Improve Your ATS Score",
    description: "Improve your estimated ATS score with practical steps for keyword alignment, formatting, skill evidence, and stronger bullets.",
    h1: "How to Improve Your ATS Score",
    intro: "Improving an ATS score is about making relevant experience easier to parse. The goal is a clearer, more targeted resume, not a document written only for software.",
    audience: "Job seekers revising a resume after seeing a low match score.",
    tips: ["Add missing keywords only when true.", "Use standard section labels.", "Quantify achievements and remove vague filler."],
    faq: [
      { question: "Can formatting lower my score?", answer: "Complex layouts can make parsing harder, especially in older ATS systems." },
      { question: "How many keywords should I add?", answer: "Add the important missing terms that accurately describe your experience." }
    ],
    priority: 0.7,
    group: "blog"
  },
  {
    slug: "/blog/resume-keyword-optimization",
    title: "Resume Keyword Optimization Without Stuffing",
    description: "Optimize resume keywords honestly by mapping job requirements to real experience and clearer accomplishment bullets.",
    h1: "Resume Keyword Optimization",
    intro: "Resume keyword optimization works best when it improves clarity. You are helping recruiters and screening tools connect your actual experience to the requirements in the posting.",
    audience: "Applicants who want better visibility without sounding robotic.",
    tips: ["Group tools in a concise skills section.", "Use the job description to choose which projects to emphasize.", "Keep sentences readable and specific."],
    faq: [
      { question: "Is keyword optimization cheating?", answer: "No, when it accurately represents your experience." },
      { question: "Can the tool optimize bullets?", answer: "It suggests stronger bullets, and you should review each one before using it." }
    ],
    priority: 0.7,
    group: "blog"
  }
];

export const allPublicPages = [...seoPages, ...blogPages];
