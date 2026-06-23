---
name: hydrab-hol
description: "HydraB Power Vehicle 360 Hands-On Lab. Use when the user wants to run the HydraB lab, set up their environment, explore fleet data, build a Cortex Agent, deploy the dashboard, or run the dbt project. Triggers: hydrab, hol, hands-on lab, vehicle 360, fleet dashboard, electric bus."
tools:
  - snowflake_sql_execute
---

# HydraB Power — Vehicle 360 Hands-On Lab

## When to use

Activate this skill whenever the user wants to install or run the HydraB Power Hands-On Lab. Trigger phrases: "run the HydraB HOL", "install the HydraB lab", "set up HydraB", "$hydrab-hol", or simply uploading this folder.

## What this skill produces (per attendee)

| Object | Location | Notes |
|--------|----------|-------|
| Database | `HYDRAB_HOL_<USER>` | One per attendee, isolated |
| Schemas | `BRONZE`, `SILVER`, `GOLD`, `PUBLIC` | inside user DB |
| BRONZE tables | 5 native tables with change tracking | OPPORTUNITY, ASSET, ODOS_EVENTS, DEFECT_EVENT, DELIVERY_TRACKING |
| SILVER Dynamic Tables | 3 auto-refreshing tables | Vehicles, Telemetry, Defects (5-min lag) |
| GOLD views | 3 analytics views | DIM_VEHICLE, FCT_LATEST_TELEMETRY, FCT_DEFECT |
| Semantic View | `GOLD.FLEET_SEMANTIC` | Business-friendly model over GOLD |
| Cortex Agent | `GOLD.FLEET_AGENT` | AI fleet intelligence assistant |
| Dashboard Service | `GOLD.DASHBOARD_SERVICE` | React app on SPCS |
| dbt Project | `GOLD.HYDRAB_FLEET_DBT` | Production-grade transforms |
| Notebook Project | `PUBLIC.HYDRAB_PROJECT` | All 5 notebooks executable |
| Git Repository | `PUBLIC.HYDRAB_GIT_REPO` | Linked to GitHub for interactive workspace |

No collisions between attendees — every object is inside their own database.

## CRITICAL INSTRUCTIONS — READ THESE FIRST

**ONLY use snowflake_sql_execute.** Every action is a SQL statement. No exceptions.

**DO NOT** create or edit notebooks, workspace files, .yaml files, or cortex_project folders.

**DO NOT** create legacy notebook objects (CREATE NOTEBOOK).

**DO NOT** modify any source files in this pack.

**DO NOT** attempt to create warehouses, compute pools, or integrations.

**DO NOT** check prerequisites before starting. Just execute the SQL in order. If a statement fails, report the error verbatim and stop. Do not retry with modifications.

## Instructions (run in this exact order)

Execute these 4 steps in order. Each step's SQL is provided below — run each statement via `snowflake_sql_execute`.

### Step 1 — Create database, copy BRONZE data, create Git repo

Creates the per-user database, schemas, copies data from shared BRONZE into native tables (required for change tracking), creates stages, and links the Git repository.

```sql
USE ROLE ACCOUNTADMIN;
```
```sql
USE WAREHOUSE HYDRAB_HOL_WH;
```

```sql
EXECUTE IMMEDIATE
$$
DECLARE
    hol_user STRING;
    hol_db   STRING;
BEGIN
    SELECT REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_') INTO hol_user;
    hol_db := 'HYDRAB_HOL_' || :hol_user;

    EXECUTE IMMEDIATE 'CREATE DATABASE IF NOT EXISTS ' || :hol_db;
    EXECUTE IMMEDIATE 'CREATE SCHEMA IF NOT EXISTS ' || :hol_db || '.BRONZE';
    EXECUTE IMMEDIATE 'CREATE SCHEMA IF NOT EXISTS ' || :hol_db || '.SILVER';
    EXECUTE IMMEDIATE 'CREATE SCHEMA IF NOT EXISTS ' || :hol_db || '.GOLD';
    EXECUTE IMMEDIATE 'CREATE STAGE IF NOT EXISTS ' || :hol_db || '.PUBLIC.NOTEBOOK_STAGE DIRECTORY=(ENABLE=TRUE)';
    EXECUTE IMMEDIATE 'CREATE STAGE IF NOT EXISTS ' || :hol_db || '.PUBLIC.DBT_STAGE DIRECTORY=(ENABLE=TRUE)';

    RETURN 'Setup complete: ' || :hol_db;
END;
$$;
```

```sql
SET HOL_DB = (SELECT CONCAT('HYDRAB_HOL_', REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_')));
USE DATABASE IDENTIFIER($HOL_DB);
```

Create the Git repository object (server-side fetch, no sandbox network access needed):
```sql
CREATE OR REPLACE GIT REPOSITORY PUBLIC.HYDRAB_GIT_REPO
  API_INTEGRATION = HYDRAB_GIT_INTEGRATION
  ORIGIN = 'https://github.com/nele-huvaere/hydrab-hol.git';
```

```sql
ALTER GIT REPOSITORY PUBLIC.HYDRAB_GIT_REPO FETCH;
```

Copy BRONZE data into native tables (enables change tracking for Dynamic Tables):
```sql
USE SCHEMA BRONZE;
```
```sql
CREATE OR REPLACE TABLE ASSET AS SELECT * FROM BRONZE.SALESFORCE.ASSET;
```
```sql
CREATE OR REPLACE TABLE OPPORTUNITY AS SELECT * FROM BRONZE.SALESFORCE.OPPORTUNITY;
```
```sql
CREATE OR REPLACE TABLE ODOS_EVENTS AS SELECT * FROM BRONZE.ODOS.EVENTS;
```
```sql
CREATE OR REPLACE TABLE DEFECT_EVENT AS SELECT * FROM BRONZE.SALESFORCE.DEFECT_EVENT__C;
```
```sql
CREATE OR REPLACE TABLE DELIVERY_TRACKING AS SELECT * FROM BRONZE.SALESFORCE.DELIVERY_TRACKING__C;
```

Enable change tracking:
```sql
ALTER TABLE ASSET SET CHANGE_TRACKING = TRUE;
```
```sql
ALTER TABLE ODOS_EVENTS SET CHANGE_TRACKING = TRUE;
```
```sql
ALTER TABLE DEFECT_EVENT SET CHANGE_TRACKING = TRUE;
```

### Step 2 — Copy files from Git repo to stages, create Notebook Project

Copy notebook files from the Git repository stage to the internal notebook stage:
```sql
COPY FILES INTO @PUBLIC.NOTEBOOK_STAGE/notebooks/
  FROM @PUBLIC.HYDRAB_GIT_REPO/branches/main/notebooks/
  PATTERN = '.*\\.ipynb';
```

Copy dbt project files:
```sql
COPY FILES INTO @PUBLIC.DBT_STAGE/hydrab_fleet/
  FROM @PUBLIC.HYDRAB_GIT_REPO/branches/main/dbt_project/
  PATTERN = '.*\\.(yml|sql)';
```

Verify files were copied:
```sql
LIST @PUBLIC.NOTEBOOK_STAGE/notebooks/;
```
```sql
LIST @PUBLIC.DBT_STAGE/hydrab_fleet/;
```

Create the Notebook Project Object:
```sql
EXECUTE IMMEDIATE
$$
DECLARE
    db STRING DEFAULT $HOL_DB;
BEGIN
    EXECUTE IMMEDIATE 'CREATE OR REPLACE NOTEBOOK PROJECT ' || :db || '.PUBLIC.HYDRAB_PROJECT FROM ''@' || :db || '.PUBLIC.NOTEBOOK_STAGE''';
    RETURN 'Notebook Project created: ' || :db || '.PUBLIC.HYDRAB_PROJECT';
END;
$$;
```

### Step 3 — Execute notebooks

Run all 5 notebooks headlessly in container runtime. Execute each one separately, one at a time:

```sql
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/01_explore_data.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';
```

```sql
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/02_build_silver_gold.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';
```

```sql
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/03_cortex_agent.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';
```

```sql
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/04_deploy_dashboard.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';
```

```sql
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/05_dbt_production.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';
```

If one fails, report the error and continue with the next.

### Step 4 — Verify and report

```sql
USE DATABASE IDENTIFIER($HOL_DB);
```

```sql
SELECT 'BRONZE.ASSET' as tbl, COUNT(*) as rows FROM BRONZE.ASSET
UNION ALL SELECT 'SILVER.VEHICLES_SILVER', COUNT(*) FROM SILVER.VEHICLES_SILVER
UNION ALL SELECT 'GOLD.DIM_VEHICLE', COUNT(*) FROM GOLD.DIM_VEHICLE
UNION ALL SELECT 'GOLD.FCT_LATEST_TELEMETRY', COUNT(*) FROM GOLD.FCT_LATEST_TELEMETRY;
```

```sql
SHOW ENDPOINTS IN SERVICE GOLD.DASHBOARD_SERVICE;
```

```sql
SHOW SEMANTIC VIEWS IN SCHEMA GOLD;
```

```sql
SHOW AGENTS IN SCHEMA GOLD;
```

```sql
SHOW DBT PROJECTS IN SCHEMA GOLD;
```

## Final Report

After all steps complete, report to the user:

1. **Data Pipeline** — Row counts for each layer
2. **Dashboard** — The ingress_url from SHOW ENDPOINTS (tell user to open in browser)
3. **Cortex Agent** — Confirm FLEET_AGENT exists, suggest sample questions:
   - "How many vehicles does each customer operate?"
   - "Which vehicles have battery SOC below 20%?"
   - "What are the most common defect types?"
4. **dbt Project** — Confirm HYDRAB_FLEET_DBT exists and ran successfully
5. **Git Workspace** — Tell the user:

> **Your Git-connected workspace is ready.**
> Go to **Workspaces** → find the repository `HYDRAB_GIT_REPO` to explore notebooks interactively.
> The notebooks, dbt project, and React app source are all available there.

## Hard constraints

- Do not touch any database other than `HYDRAB_HOL_<USER>`.
- `BRONZE` (shared database) is **read-only** — never write to it.
- Use warehouse `HYDRAB_HOL_WH` everywhere.
- Always derive the user namespace from `CURRENT_USER()`.
- Do not modify notebooks or files in this pack at runtime.
- **Do not create warehouses, compute pools, or integrations.** They must already exist.

## Data Architecture

```
HYDRAB_HOL_<USER>.BRONZE (native tables, change tracking enabled)
├── ASSET, OPPORTUNITY, ODOS_EVENTS, DEFECT_EVENT, DELIVERY_TRACKING
│   (copied from shared BRONZE database)

HYDRAB_HOL_<USER>.SILVER (Dynamic Tables, 5-min lag)
├── VEHICLES_SILVER, TELEMETRY_SILVER, DEFECTS_SILVER

HYDRAB_HOL_<USER>.GOLD (Views + AI)
├── DIM_VEHICLE, FCT_LATEST_TELEMETRY, FCT_DEFECT
├── FLEET_SEMANTIC (Semantic View)
├── FLEET_AGENT (Cortex Agent)
└── DASHBOARD_SERVICE (SPCS)
```

## Account Details

- Account: `sfseeurope-nhuvaere_azure1`
- BRONZE source: shared database `BRONZE` (from `GXNIMKH.HV05860`)
- Compute Pool: `HYDRAB_HOL_POOL` (pre-provisioned)
- Image Repo: `HYDRAB_HOL_SHARED.PUBLIC.IMAGE_REPO` (pre-provisioned)
- Warehouse: `HYDRAB_HOL_WH` (pre-provisioned)
- Git Integration: `HYDRAB_GIT_INTEGRATION` (pre-provisioned)
- Git Repo URL: `https://github.com/nele-huvaere/hydrab-hol.git`
