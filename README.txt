# HeatLens — Urban Climate Intelligence Platform
# MASTER README — START HERE
=============================================================

## FOLDER STRUCTURE

D:\IMAGINE_CUP_HeatLens\
│
├── 01_Project_Overview\
│   └── PROJECT_OVERVIEW.txt          ← What HeatLens is, impact, links
│
├── 02_Azure_Integration_Plan\
│   └── AZURE_INTEGRATION_BLUEPRINT.txt ← Which Azure services, how to integrate
│
├── 03_Competition_Strategy\
│   └── WINNING_STRATEGY.txt          ← Pitch script, judging criteria, Q&A prep
│
├── 04_Technical_Architecture\
│   └── TECHNICAL_ARCHITECTURE.txt    ← Full system design (current + Azure target)
│
├── 05_Submission_Assets\
│   └── SUBMISSION_CHECKLIST.txt      ← What to submit, templates, GitHub cleanup
│
├── backend\
│   ├── azure_functions\              ← Serverless satellite ingestion (to be built)
│   ├── core_science\                 ← LST math, AHP scoring, Monte Carlo (to be built)
│   ├── data\                         ← GeoTIFF rasters, ward GeoJSON (to be built)
│   └── services\                     ← Azure OpenAI function calling service (to be built)
│
├── frontend\                         ← React 18 + Azure Maps UI (to be built)
│
└── README.txt                        ← THIS FILE

=============================================================
## WEEK-BY-WEEK ACTION PLAN
=============================================================

WEEK 1 (Nov 1–7): AZURE SETUP + MAPS
  Day 1: Create Azure for Students account (azure.microsoft.com/en-us/free/students)
          → Get $100 free credits, no credit card needed
  Day 2: Create Resource Group: heatlens-imagine-cup-rg (region: Central India)
          Create Azure Maps account: heatlens-maps
  Day 3: Integrate Azure Maps into existing HeatLens frontend
          Replace Leaflet.js with azure-maps-control npm package
  Day 4: Test ward boundary GeoJSON rendering on Azure Maps
  Day 5: Style choropleth heat map (green → yellow → red gradient)
  Day 6-7: Polish + push to GitHub

WEEK 2 (Nov 8–14): AZURE OPENAI NATURAL LANGUAGE INTERFACE
  Day 1: Create Azure OpenAI resource: heatlens-openai (GPT-4o-mini)
  Day 2: Define function calling tools:
          get_ward_lst(ward_name, date)
          get_top_hottest_wards(city, k, date)
          compare_wards(ward_list, date)
  Day 3: Build FastAPI backend endpoint: POST /api/chat
          Streams Azure OpenAI response → triggers map update
  Day 4: Connect frontend chat box → backend → Azure Maps live update
  Day 5: Test: "Which 5 wards in Delhi need cooling centers this July?"
  Day 6-7: Fine-tune prompts + edge cases

WEEK 3 (Nov 15–21): AZURE FUNCTIONS + BLOB STORAGE
  Day 1: Install Azure Functions Core Tools
          func init heatlens-backend --python
  Day 2: Migrate satellite ingestion pipeline to Azure Functions
          Timer trigger: weekly Landsat data refresh
  Day 3: Create Azure Blob Storage: heatlens-storage
          Upload sample GeoTIFF rasters + ward_scores JSON
  Day 4: Connect Azure Functions output → Blob Storage
  Day 5: Test end-to-end: Function runs → processes data → stores in Blob → frontend reads
  Day 6-7: Add Azure CDN for fast tile serving

WEEK 4 (Nov 22–28): DEMO VIDEO + SUBMISSION POLISH
  Day 1: Write 500-word project description (use template in 05_Submission_Assets)
  Day 2: Record 3-minute demo video (OBS Studio, 1080p)
          Script: 03_Competition_Strategy/WINNING_STRATEGY.txt
  Day 3: GitHub repo cleanup (README, CI/CD badge, clean commits)
  Day 4: Register at https://imagine.microsoft.com
  Day 5: Submit all assets
  Day 6-7: Buffer for fixes

=============================================================
## IMMEDIATE FIRST STEP (DO THIS NOW)
=============================================================

1. Go to: https://azure.microsoft.com/en-us/free/students
2. Sign in with your college email (@abesec.ac.in or similar)
3. Get $100 free Azure credits — NO credit card required
4. Create Resource Group: heatlens-imagine-cup-rg

That's it. 10 minutes. Then come back and start Week 1 Day 2.

=============================================================
## KEY LINKS
=============================================================

Microsoft Learn          : https://learn.microsoft.com
Azure for Students       : https://azure.microsoft.com/en-us/free/students
Azure Maps Docs          : https://learn.microsoft.com/en-us/azure/azure-maps/
Azure OpenAI Docs        : https://learn.microsoft.com/en-us/azure/ai-services/openai/
Azure Functions Python   : https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-python
HeatLens Live            : https://heat-lens-ecobuilders.vercel.app/
HuggingFace Space        : https://huggingface.co/spaces/rohitsinghudi1372008/heatlens-satellite-lst-oracle
GitHub                   : https://github.com/rohitsingh0166
