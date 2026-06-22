---
name: hydrab-hol
description: "HydraB Power Vehicle 360 Hands-On Lab. Use when the user wants to run the HydraB lab, set up their environment, explore fleet data, build a Cortex Agent, or deploy the dashboard. Triggers: hydrab, hol, hands-on lab, vehicle 360, fleet dashboard, electric bus."
---

# HydraB Power — Vehicle 360 Hands-On Lab

You are guiding a participant through the HydraB Power Hands-On Lab. This lab builds a unified fleet intelligence platform for an electric bus manufacturer using Snowflake.

## Lab Overview

HydraB Power manufactures zero-emission buses for public transit operators across the UK & Ireland. This lab combines their Salesforce CRM data (sales pipeline, vehicle master data, delivery tracking) with Odos Telemetry API data (GPS, battery SOC, temperature, speed) into a single Snowflake platform — and builds an AI-powered dashboard on top.

## What's In This Folder

```
hydrab-hol/
├── notebooks/
│   ├── 01_setup.ipynb            — Creates your per-user database & schemas
│   ├── 02_explore_data.ipynb     — Explore Salesforce + Odos data
│   ├── 03_build_gold.ipynb       — Dynamic Tables, Semantic View, Cortex Agent
│   └── 04_deploy_dashboard.ipynb — Deploy React app to SPCS
├── react-app/                    — Full Next.js dashboard source
├── spec/                         — SPCS service specification
└── skills/hydrab-hol/SKILL.md    — This file (instructions for CoCo)
```

## CRITICAL INSTRUCTIONS FOR THE AGENT

**DO NOT create or edit notebooks.** The notebooks are already complete `.ipynb` files in the `notebooks/` folder. They are ready to open and run as-is.

**DO NOT build cells one by one.** Never use notebook_add_cell or notebook_edit_cell.

**What you SHOULD do when this skill is invoked:**
1. Run ALL setup SQL directly using snowflake_sql_execute (steps 1-6 below)
2. Verify each step worked with validation queries
3. Report success/failure for each step
4. Tell the user to create a Workspace from the Git repository (instructions below)

## Full Installation (run ALL steps automatically)

Execute these SQL statements in order using snowflake_sql_execute. Run them ALL without asking — this is a one-shot install.

### Step 1: Create per-user database and schemas
```sql
USE ROLE ACCOUNTADMIN;
SET user_db = 'HYDRAB_HOL_' || CURRENT_USER();
CREATE DATABASE IF NOT EXISTS IDENTIFIER($user_db);
USE DATABASE IDENTIFIER($user_db);
CREATE SCHEMA IF NOT EXISTS BRONZE;
CREATE SCHEMA IF NOT EXISTS SILVER;
CREATE SCHEMA IF NOT EXISTS GOLD;
CREATE SCHEMA IF NOT EXISTS SYNTHETIC;
```

### Step 2: Create warehouse
```sql
CREATE WAREHOUSE IF NOT EXISTS HYDRAB_HOL_WH
  WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = FALSE;
USE WAREHOUSE HYDRAB_HOL_WH;
```

### Step 3: Link BRONZE shared data
The admin has already imported the BRONZE database from the inbound share.
Create views in the user's BRONZE schema pointing to it:
```sql
USE SCHEMA IDENTIFIER($user_db || '.BRONZE');

CREATE OR REPLACE VIEW OPPORTUNITY AS
  SELECT * FROM BRONZE.SALESFORCE.OPPORTUNITY;

CREATE OR REPLACE VIEW ASSET AS
  SELECT * FROM BRONZE.SALESFORCE.ASSET;

CREATE OR REPLACE VIEW ODOS_EVENTS AS
  SELECT * FROM BRONZE.ODOS.EVENTS;

CREATE OR REPLACE VIEW DEFECT_EVENT AS
  SELECT * FROM BRONZE.SALESFORCE.DEFECT_EVENT__C;

CREATE OR REPLACE VIEW DELIVERY_TRACKING AS
  SELECT * FROM BRONZE.SALESFORCE.DELIVERY_TRACKING__C;
```

NOTE: The shared data lives in database `BRONZE` (schemas: SALESFORCE, ODOS).
If the BRONZE database doesn't exist, the admin hasn't set up the inbound share yet.
Tell the user: "The shared BRONZE database isn't available. Ask the lab facilitator to run admin_setup.sql first."

### Step 4: Build SILVER Dynamic Tables
```sql
USE SCHEMA IDENTIFIER($user_db || '.SILVER');

CREATE OR REPLACE DYNAMIC TABLE VEHICLES_SILVER
  TARGET_LAG = '5 minutes'
  WAREHOUSE = HYDRAB_HOL_WH
AS
SELECT
  "Chassis_Number__c" AS vin,
  "Product_Name__c" AS model,
  "Account_Name__c" AS customer,
  "Depot_Name__c" AS depot,
  "Status" AS status,
  "Install_Date" AS install_date
FROM BRONZE.ASSET
WHERE "Chassis_Number__c" IS NOT NULL;

CREATE OR REPLACE DYNAMIC TABLE TELEMETRY_SILVER
  TARGET_LAG = '5 minutes'
  WAREHOUSE = HYDRAB_HOL_WH
AS
SELECT
  RAW:vin::STRING AS vin,
  RAW:timestamp::TIMESTAMP AS event_time,
  RAW:signals:battery_soc::FLOAT AS battery_soc,
  RAW:signals:speed::FLOAT AS speed_kmh,
  RAW:signals:battery_temperature::FLOAT AS cell_temp,
  RAW:signals:latitude::FLOAT AS latitude,
  RAW:signals:longitude::FLOAT AS longitude
FROM BRONZE.ODOS_EVENTS;

CREATE OR REPLACE DYNAMIC TABLE DEFECTS_SILVER
  TARGET_LAG = '5 minutes'
  WAREHOUSE = HYDRAB_HOL_WH
AS
SELECT
  "Asset__c" AS asset_id,
  "Defect_Type__c" AS defect_type,
  "Severity__c" AS severity,
  "Root_Cause__c" AS root_cause,
  "Repair_Cost__c" AS repair_cost,
  "CreatedDate" AS created_date
FROM BRONZE.DEFECT_EVENT;
```

### Step 5: Build GOLD views
```sql
USE SCHEMA IDENTIFIER($user_db || '.GOLD');

CREATE OR REPLACE VIEW DIM_VEHICLE AS
SELECT * FROM SILVER.VEHICLES_SILVER;

CREATE OR REPLACE VIEW FCT_LATEST_TELEMETRY AS
SELECT *
FROM SILVER.TELEMETRY_SILVER
QUALIFY ROW_NUMBER() OVER (PARTITION BY vin ORDER BY event_time DESC) = 1;

CREATE OR REPLACE VIEW FCT_DEFECT AS
SELECT * FROM SILVER.DEFECTS_SILVER;
```

### Step 6: Enable cross-region inference
```sql
ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION';
```

## Validation (run after install)

After all steps complete, run these validation queries and report the results:

```sql
-- Check row counts
SELECT 'BRONZE.OPPORTUNITY' as tbl, COUNT(*) as rows FROM BRONZE.OPPORTUNITY
UNION ALL SELECT 'BRONZE.ASSET', COUNT(*) FROM BRONZE.ASSET
UNION ALL SELECT 'BRONZE.ODOS_EVENTS', COUNT(*) FROM BRONZE.ODOS_EVENTS
UNION ALL SELECT 'SILVER.VEHICLES_SILVER', COUNT(*) FROM SILVER.VEHICLES_SILVER
UNION ALL SELECT 'GOLD.DIM_VEHICLE', COUNT(*) FROM GOLD.DIM_VEHICLE;
```

Report to the user:
- Which steps succeeded/failed
- Row counts from validation
- **NEXT STEP — Open the notebooks in Workspaces.** Tell the user:

> **Your Snowflake environment is ready!** Now open the notebooks:
> 1. Go to **Workspaces** (top-left navigation)
> 2. Click **+ Add new** → **From Git repository**
> 3. Paste this URL: `https://github.com/nele-huvaere/hydrab-hol.git`
> 4. Select API Integration: **HYDRAB_GIT_INTEGRATION**
> 5. Authentication: **Public repository**
> 6. Click **Create**
>
> All notebooks will appear in your workspace:
> - `notebooks/02_explore_data.ipynb` — Explore Salesforce + Odos data
> - `notebooks/03_build_gold.ipynb` — Build Semantic View & Cortex Agent
> - `notebooks/04_deploy_dashboard.ipynb` — Deploy React dashboard to SPCS
>
> The `react-app/` source is also there for CoCo Desktop extension later.

- Do NOT tell the user to manually upload notebooks — they connect via Git

## Phase 2: Extend with CoCo Desktop

After the lab, users open this folder in Cortex Code Desktop to extend the React app.

### Extension Challenges

When the user asks to extend the app, guide them through these ideas:

1. **Add a Delivery Tracking page** — Use `DELIVERY_TRACKING__C` data to show delivery pipeline status with a Sankey or funnel chart
2. **Connect live Snowflake queries** — Replace static JSON API routes with real Snowflake queries using the Snowflake Node.js driver
3. **Add a Defects page** — Show defect events by model/depot with a heatmap
4. **Improve the Fleet Map** — Add vehicle detail popups, color by SOC level, add route history
5. **Ask the Agent** — Build a natural language query interface that calls the Cortex Agent

### How to Re-Deploy

After making changes to the React app:
1. Build the Docker image: `docker build -t hydrab-dashboard:v2 ./react-app`
2. Tag and push to the image repo
3. `ALTER SERVICE ... FROM SPECIFICATION ...` to update the SPCS service

## Data Architecture

```
BRONZE (Inbound Share)
├── SALESFORCE
│   ├── OPPORTUNITY (1,056 rows) — Sales pipeline
│   ├── ASSET (42,884 rows) — Vehicle master
│   ├── ASSET_LOCATION_HISTORY__C (1.85M) — GPS history
│   ├── DEFECT_EVENT__C (47,813) — Defects
│   └── DELIVERY_TRACKING__C (6,621) — Delivery status
└── ODOS
    └── EVENTS (860K) — Raw telemetry JSON

SILVER (Dynamic Tables, 5-min lag)
├── VEHICLES_SILVER
├── TELEMETRY_SILVER
└── DEFECTS_SILVER

GOLD (Views + AI)
├── DIM_VEHICLE, DIM_CUSTOMER, DIM_DEPOT
├── FCT_TELEMETRY, FCT_DEFECT
├── FLEET_SEMANTIC (Semantic View)
└── FLEET_AGENT (Cortex Agent)
```

## Key Technical Notes

- Salesforce columns need quoting: `"Region__c"`, `"StageName"`, `"Amount"`
- VIN join: `ASSET."Chassis_Number__c"` = Odos JSON `vin` field
- 2,492 VINs overlap between Salesforce and Odos
- Cortex Agent uses: Cortex Analyst (structured) + Cortex Search (unstructured)
- Cross-region inference: `ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION'`

## Snowflake Account Details

- Account: `sfseeurope-nhuvaere_azure1`
- BRONZE Share from: `GXNIMKH.HV05860`
- Compute Pool: `HYDRAB_HOL_POOL`
- Image Repo: `HYDRAB_HOL_SHARED.PUBLIC.IMAGE_REPO`
