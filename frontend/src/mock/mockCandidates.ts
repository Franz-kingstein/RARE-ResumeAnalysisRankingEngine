import type { Candidate } from "../types";

/**
 * Full mock candidate pool — 18 candidates with diverse skill sets.
 * Scores are intentionally LEFT UNSET (0) here; the mock engine will
 * compute deterministic scores per job-description at analysis time.
 */
export interface RawCandidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  baseSkills: string[];
  experience: string;
  location: string;
  source: string;
}

export const MOCK_CANDIDATE_POOL: RawCandidate[] = [
  {
    id: "AJ",
    name: "Alice Johnson",
    initials: "AJ",
    role: "Senior Software Engineer",
    baseSkills: ["Go", "Docker", "Kubernetes", "Microservices", "gRPC", "Observability"],
    experience: "8 yrs",
    location: "San Francisco, CA",
    source: "LinkedIn",
  },
  {
    id: "CD",
    name: "Charlie Davis",
    initials: "CD",
    role: "Fullstack Developer",
    baseSkills: ["Python", "Django", "AWS", "Kubernetes", "PostgreSQL", "Redis"],
    experience: "5 yrs",
    location: "Austin, TX",
    source: "Indeed",
  },
  {
    id: "BS",
    name: "Bob Smith",
    initials: "BS",
    role: "Frontend Engineer",
    baseSkills: ["React", "TypeScript", "CSS", "HTML", "GraphQL", "Jest"],
    experience: "3 yrs",
    location: "New York, NY",
    source: "Campus",
  },
  {
    id: "DC",
    name: "Diana Chen",
    initials: "DC",
    role: "DevOps / SRE",
    baseSkills: ["Kubernetes", "Terraform", "AWS", "Go", "Prometheus", "Grafana"],
    experience: "7 yrs",
    location: "Seattle, WA",
    source: "LinkedIn",
  },
  {
    id: "EP",
    name: "Ethan Park",
    initials: "EP",
    role: "Backend Engineer",
    baseSkills: ["Java", "Spring Boot", "Microservices", "Docker", "Kafka", "PostgreSQL"],
    experience: "6 yrs",
    location: "Chicago, IL",
    source: "Naukri",
  },
  {
    id: "FW",
    name: "Fiona Walsh",
    initials: "FW",
    role: "ML Engineer",
    baseSkills: ["Python", "TensorFlow", "PyTorch", "SQL", "Spark", "Docker"],
    experience: "4 yrs",
    location: "Boston, MA",
    source: "Campus",
  },
  {
    id: "GK",
    name: "George Kim",
    initials: "GK",
    role: "Cloud Architect",
    baseSkills: ["AWS", "GCP", "Terraform", "Docker", "Kubernetes", "CDK"],
    experience: "10 yrs",
    location: "Denver, CO",
    source: "Referral",
  },
  {
    id: "HL",
    name: "Hannah Lee",
    initials: "HL",
    role: "Full Stack Engineer",
    baseSkills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "GraphQL"],
    experience: "4 yrs",
    location: "Portland, OR",
    source: "LinkedIn",
  },
  {
    id: "IP",
    name: "Ivan Petrov",
    initials: "IP",
    role: "Systems Engineer",
    baseSkills: ["Rust", "Go", "gRPC", "Kafka", "Distributed Systems", "Linux"],
    experience: "9 yrs",
    location: "Remote",
    source: "Portal",
  },
  {
    id: "JM",
    name: "Julia Martinez",
    initials: "JM",
    role: "Data Engineer",
    baseSkills: ["Python", "Spark", "Airflow", "SQL", "dbt", "Snowflake"],
    experience: "5 yrs",
    location: "Miami, FL",
    source: "Indeed",
  },
  {
    id: "KO",
    name: "Kevin O'Brien",
    initials: "KO",
    role: "Frontend Specialist",
    baseSkills: ["Vue.js", "React", "TypeScript", "CSS", "WebGL", "Storybook"],
    experience: "4 yrs",
    location: "Dublin, IE",
    source: "LinkedIn",
  },
  {
    id: "LM",
    name: "Lena Müller",
    initials: "LM",
    role: "DevSecOps Engineer",
    baseSkills: ["Docker", "Kubernetes", "Vault", "Terraform", "CI/CD", "Python"],
    experience: "6 yrs",
    location: "Berlin, DE",
    source: "Portal",
  },
  {
    id: "MJ",
    name: "Marcus Johnson",
    initials: "MJ",
    role: "Backend Engineer",
    baseSkills: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Celery"],
    experience: "5 yrs",
    location: "Atlanta, GA",
    source: "Naukri",
  },
  {
    id: "NP",
    name: "Nina Patel",
    initials: "NP",
    role: "Mobile Engineer",
    baseSkills: ["Swift", "Kotlin", "React Native", "Firebase", "REST APIs", "CI/CD"],
    experience: "3 yrs",
    location: "San Jose, CA",
    source: "Campus",
  },
  {
    id: "OH",
    name: "Omar Hassan",
    initials: "OH",
    role: "Site Reliability Engineer",
    baseSkills: ["Go", "Prometheus", "Grafana", "Kubernetes", "Incident Response", "AWS"],
    experience: "7 yrs",
    location: "London, UK",
    source: "LinkedIn",
  },
  {
    id: "PS",
    name: "Priya Sharma",
    initials: "PS",
    role: "Full Stack Engineer",
    baseSkills: ["React", "Python", "Django", "AWS", "Docker", "TypeScript"],
    experience: "5 yrs",
    location: "Bangalore, IN",
    source: "Naukri",
  },
  {
    id: "QA",
    name: "Quinn Adams",
    initials: "QA",
    role: "Data Scientist",
    baseSkills: ["R", "Python", "Scikit-learn", "SQL", "Tableau", "Statistics"],
    experience: "4 yrs",
    location: "Toronto, CA",
    source: "Campus",
  },
  {
    id: "RG",
    name: "Rachel Green",
    initials: "RG",
    role: "Principal Engineer",
    baseSkills: ["Go", "Rust", "gRPC", "Microservices", "System Design", "Kubernetes"],
    experience: "12 yrs",
    location: "San Francisco, CA",
    source: "Referral",
  },
];

/** Sources distribution for analytics */
export const CANDIDATE_SOURCES = [
  "LinkedIn",
  "Indeed",
  "Naukri",
  "Campus",
  "Portal",
  "Referral",
] as const;

/** Rebuild a full Candidate object from a raw pool entry + computed fields */
export function buildCandidate(
  raw: RawCandidate,
  score: number,
  matchLevel: Candidate["matchLevel"],
  insight: string,
): Candidate {
  return {
    id: raw.id,
    name: raw.name,
    initials: raw.initials,
    role: raw.role,
    score,
    matchLevel,
    skills: raw.baseSkills.slice(0, 4), // show top 4 skills in UI
    insight,
    experience: raw.experience,
    location: raw.location,
    source: raw.source,
  };
}
