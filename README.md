# 🎓 Forsaken CGPA & GPA Academic Portal

<div align="center">

![Forsaken Academic Portal](https://img.shields.io/badge/Forsaken-CGPA%20Portal-0ea5e9?style=for-the-badge&logo=graduation-cap)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-REST_API-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-SQL_Database-4169E1?style=for-the-badge&logo=postgresql)
![AWS](https://img.shields.io/badge/AWS-S3_%7C_CloudFront_%7C_EC2-FF9900?style=for-the-badge&logo=amazon-aws)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=json-web-tokens)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Styling-38BDF8?style=for-the-badge&logo=tailwindcss)

**An enterprise-grade, highly decoupled academic performance portal built with Protocol, Prototype, and Stage-Based Pipeline Design Patterns.**

Calculate GPA/CGPA, evaluate rules under multiple grading regulations, predict future target grades, get AI-powered academic advice, and generate executive **3D-styled printable PDF official transcripts** — all in one web application.

[🚀 About](#-about-the-project) • [✨ Features](#-key-features) • [🏛️ Architecture](#%EF%B8%8F-system-architecture) • [🗺️ Project Map](#%EF%B8%8F-project-map--directory-structure) • [⚙️ Implementation](#%EF%B8%8F-core-engine-implementation-details) • [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) • [📥 Setup](#-installation--setup) • [🧪 Testing](#-unit-testing-suite)

</div>

---

# 🚀 About The Project

**Forsaken CGPA & GPA Academic Portal** is an advanced React 19 web application built for Anna University students and academic institutions. 

Unlike traditional static grade calculators, this portal uses an enterprise software architecture featuring:
- **Pluggable Academic Regulations Protocols** (Anna University Reg 2021, Reg 2017, US 4.0 Scale)
- **Object-Oriented Domain Prototypes** (`CoursePrototype`, `SemesterPrototype`, `TranscriptPrototype`)
- **7-Stage Data Analysis Pipeline** (`AnalysisPipeline`)
- **AI-Powered Academic Performance Advisory Engine**
- **3D Executive Printable PDF Official Transcript Engine** with verification security seal stamps

---

# ✨ Key Features

## 📊 1. Pluggable Academic Regulations Protocol
Switch grading scales dynamically across semesters without changing core calculation logic:
- **Anna University Regulation 2021**: (O: 10, A+: 9, A: 8, B+: 7, B: 6, C+: 5, U: 0)
- **Anna University Regulation 2017**: (O: 10, A+: 9, A: 8, B+: 7, B: 6, RA: 0, SA: 0)
- **US 4.0 Standard GPA Scale**: (A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0)

## 💡 2. AI Academic Advisor & Grade Boost Analyzer
- **Standing Classification**: Automatically categorizes academic standing (*First Class with Distinction, First Class, Second Class, or Arrear Recovery*).
- **Target Grade Predictor ("What-If" Analysis)**: Computes exact GPA required in remaining semesters to achieve target CGPA.
- **Grade Boost Impact Table**: Ranks subjects by their maximum potential CGPA increase (e.g., `+0.18 CGPA` gain if improved).

## 📜 3. 3D Executive Official Report & PDF Export
- **Dual-Foil Metallic Border**: High-contrast cyan/indigo/gold luxury border wrapper.
- **Security Microprint Ribbon**: `FORSAKEN ACADEMIC PORTAL • SECURE ENCRYPTED TRANSCRIPT`.
- **Double-Ring 3D Digital Security Seal Stamp**: Metallic circular seal stamp with verification ID (`#710023104001`) and signatures of the Head of Department & Controller of Examinations.

## ⏱️ 4. Interactive Pipeline Debugger / Tracer
- Live stage execution timeline under the **Insights** tab.
- Displays millisecond execution durations (`0.12ms`) and collapsible JSON state inspection objects for each pipeline stage.

## 💾 5. Smart Data Management
- Multi-semester store with Local Storage persistence.
- Automatic credit-weighted calculation and department course pre-loader templates (CSE, IT, ECE, EEE, Mechanical, AI&DS).

---

# 🏛️ System Architecture

The application is structured into decoupled core architectural layers:

```
+------------------------------------------------------------------------+
|                        User Interface Layer                            |
|        (React 19 + Tailwind CSS + Lucide Icons + Ambient Grid)         |
+-----------------------------------┬------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                        Domain Prototypes Layer                         |
|     (TranscriptPrototype ---> SemesterPrototype ---> CoursePrototype)  |
+-----------------------------------┬------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                       Pluggable Protocols Layer                        |
| (AnnaUniversityReg2021 | AnnaUniversityReg2017 | USFourPointGPA)      |
+-----------------------------------┬------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|                      7-Stage Analysis Pipeline                         |
|  Validation ---> GPA ---> CGPA ---> Classification ---> What-If --->   |
|  Analytics ---> AI Advisor Engine                                      |
+-----------------------------------┬------------------------------------+
                                    |
                                    v
+------------------------------------------------------------------------+
|             Results View, Live Pipeline Tracer & 3D PDF Engine         |
+------------------------------------------------------------------------+
```

---

# 🗺️ Project Map & Directory Structure

```
Forsaken CGPA & GPA Academic Portal/
├── src/
│   ├── core/                           # Academic Core Engine Architecture
│   │   ├── protocols/                  # Regulations Protocol Layer
│   │   │   ├── AcademicRegulationProtocol.js  # Base Protocol Contract
│   │   │   ├── AnnaUniversityReg2021.js        # Reg 2021 Grade Mapping & Rules
│   │   │   ├── AnnaUniversityReg2017.js        # Reg 2017 Grade Mapping & Rules
│   │   │   ├── USFourPointGPA.js              # US 4.0 Standard Mapping
│   │   │   └── index.js                        # Protocol Factory & Exporter
│   │   │
│   │   ├── prototypes/                 # OOP Domain Models
│   │   │   ├── CoursePrototype.js          # Course Model (Credits, Grade Points)
│   │   │   ├── SemesterPrototype.js        # Semester Aggregator Model
│   │   │   ├── TranscriptPrototype.js      # Student Transcript Model
│   │   │   └── index.js
│   │   │
│   │   ├── pipelines/                  # Stage-Based Pipeline Architecture
│   │   │   ├── AnalysisPipeline.js         # Pipeline Execution Orchestrator
│   │   │   ├── stages/                     # Pipeline Stage Processors
│   │   │   │   ├── ValidationStage.js      # 1. Data Integrity & Input Sanitizer
│   │   │   │   ├── GPACalculationStage.js  # 2. Semester GPA Calculation Stage
│   │   │   │   ├── CGPACalculationStage.js # 3. Cumulative CGPA Stage
│   │   │   │   ├── ClassificationStage.js  # 4. Arrear & Honors Classification
│   │   │   │   ├── WhatIfPredictionStage.js# 5. Target GPA Predictor Stage
│   │   │   │   ├── AnalyticsStage.js       # 6. Quality Point Impact Analyzer
│   │   │   │   └── AdvisorStage.js         # 7. AI Performance Advisory Engine
│   │   │   └── index.js
│   │   │
│   │   ├── core.test.js                # Vitest Test Suite for Core Engine
│   │   └── index.js                        # Core Module Entry Point
│   │
│   ├── App.jsx                         # Main Application Container & Tab Views
│   ├── templates.js                    # Department Course Templates (CSE/ECE/etc.)
│   ├── index.css                       # Design System, Glassmorphism & 3D Print CSS
│   └── main.jsx                        # React 19 Root Hydration Entry
│
├── public/                             # Static Assets & Icons
├── index.html                          # HTML5 Entry Point
├── package.json                        # Node Dependencies & Test Scripts
├── vite.config.js                      # Vite & Vitest Configuration
└── README.md                           # Documentation
```

---

# ⚙️ Core Engine Implementation Details

### 1. Pluggable Regulation Protocols (`src/core/protocols/`)
All regulation rules inherit from `AcademicRegulationProtocol`. Each protocol implements:
- `getGradePoints(grade)`: Maps letter grade to numeric points.
- `isPassingGrade(grade)`: Determines if credit is earned.
- `calculateGPA(courses)`: Evaluates credit-weighted average:
  $$\text{GPA} = \frac{\sum (\text{Credits}_i \times \text{Grade Points}_i)}{\sum \text{Credits}_i}$$

### 2. Domain Prototypes (`src/core/prototypes/`)
- `CoursePrototype`: Encapsulates code, title, credits, letter grade, and grade points.
- `SemesterPrototype`: Maintains list of courses, computes total credits earned vs attempted, and calculates semester GPA.
- `TranscriptPrototype`: Aggregates all semesters, computes overall CGPA, total credits, arrear counts, and target predictions.

### 3. 7-Stage Execution Pipeline (`src/core/pipelines/`)
When the user updates course details or switches tabs, `AnalysisPipeline.execute(transcript, regulation)` runs sequentially through 7 isolated stages:

| Stage | Class | Functionality |
|-------|-------|---------------|
| 1️⃣ | `ValidationStage` | Validates non-negative credits, valid grade keys, and semester data integrity. |
| 2️⃣ | `GPACalculationStage` | Computes semester-wise GPA using active regulation protocol. |
| 3️⃣ | `CGPACalculationStage` | Calculates cumulative CGPA across all passed/attempted semesters. |
| 4️⃣ | `ClassificationStage` | Evaluates distinction criteria ($\text{CGPA} \ge 8.5$), first class ($\text{CGPA} \ge 6.5$), or standing arrears. |
| 5️⃣ | `WhatIfPredictionStage` | Projects target GPA needed for target CGPA over remaining semesters. |
| 6️⃣ | `AnalyticsStage` | Computes grade improvement impact matrix for low-scoring courses. |
| 7️⃣ | `AdvisorStage` | Generates AI career guidance cards based on academic standing. |

---

# 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend Framework** | ⚛️ React 19 | Modern Reactive Component Architecture (JavaScript) |
| **Backend REST API** | 🐍 Python (FastAPI) | High-performance asynchronous REST API engine |
| **Database** | 🐘 PostgreSQL | Relational database (SQLAlchemy 2.0 Async ORM) |
| **Authentication** | 🔐 JWT & Bcrypt | Secure token-based auth for user accounts |
| **Cloud Hosting** | ☁️ AWS (S3, CloudFront, EC2) | Static frontend on S3/CloudFront CDN, API on EC2 |
| **DevOps & Containers** | 🐳 Docker & Compose | Containerized backend & database orchestration |
| **Reverse Proxy** | 🌐 Nginx | High-performance reverse proxy & SSL termination |
| **API Testing** | 📮 Postman & Swagger | Auto-generated OpenAPI documentation at `/docs` |
| **Styling** | 🎨 Tailwind CSS | Custom Glassmorphism, 3D Elevation & Cyberpunk Themes |

---

# 📥 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/rsmsurya-sys/CGPA-GPA-portal.git
```

### 2. Navigate Into Project Folder

```bash
cd CGPA-GPA-portal
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Application

Open your browser and visit:
```
http://localhost:5173
```

---

# ⚡ Command Reference

| Command | Description |
|---------|-------------|
| `cd CGPA-GPA-portal` | Navigates into project root directory |
| `npm install` | Installs all required project dependencies |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Builds production bundle into `dist/` directory |
| `npm test` | Runs Vitest automated unit test suite |

---

# 🧪 Unit Testing Suite

The core architecture includes a complete Vitest suite covering protocols, prototypes, and pipeline stages:

```bash
npm test
```

### Test Coverage Highlights:
- ✅ **Protocol Verification**: Validates grade point mappings for Reg 2021, Reg 2017, and US 4.0 scales.
- ✅ **Prototype Integrity**: Verifies credit accumulation and grade calculations on `SemesterPrototype` & `TranscriptPrototype`.
- ✅ **Pipeline Stage Execution**: Tests all 7 stages of `AnalysisPipeline` with sample transcript datasets.

---

# 📸 Application Layout

```
/src
   ├── App.jsx            # Main Dashboard & Multi-Tab Interface
   ├── index.css          # Ambient Mesh Grid, Glassmorphism, 3D Print CSS
   └── core/              # Protocol, Prototype & 7-Stage Pipeline Engine
```

---

# 🎯 Future Enhancements

- 🔐 Student Authentication & Cloud Sync
- ☁️ Cloud Vector DB Integration for AI Academic Counseling
- 📱 Progressive Web App (PWA) Mobile Support
- 🎓 Direct University Result Portal Web Scraper
- 🤖 Fine-Tuned Local LLM Advice Engine

---

# 👨‍💻 Developer

**Forsaken Development Team**

Building modern, high-performance academic solutions for students.

---

# 📜 License

This project is licensed under the **MIT License**.

---

<div align="center">

⭐ If you find this project useful, consider giving it a star on GitHub!

**Made with ❤️ by Forsaken**

</div>