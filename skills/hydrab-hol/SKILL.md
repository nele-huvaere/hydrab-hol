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
| BRONZE views | 5 views over shared data | Opportunity, Asset, Odos_Events, Defect_Event, Delivery_Tracking |
| SILVER Dynamic Tables | 3 auto-refreshing tables | Vehicles, Telemetry, Defects (5-min lag) |
| GOLD views | 3 analytics views | DIM_VEHICLE, FCT_LATEST_TELEMETRY, FCT_DEFECT |
| Semantic View | `GOLD.FLEET_SEMANTIC` | Business-friendly model over GOLD |
| Cortex Agent | `GOLD.FLEET_AGENT` | AI fleet intelligence assistant |
| Dashboard Service | `GOLD.DASHBOARD_SERVICE` | React app on SPCS |
| dbt Project | `GOLD.HYDRAB_FLEET_DBT` | Production-grade transforms |
| Notebook Project | `PUBLIC.HYDRAB_PROJECT` | All 5 notebooks executable |

No collisions between attendees — every object is inside their own database.

## CRITICAL INSTRUCTIONS

**ONLY use snowflake_sql_execute.** Every action is a SQL statement.

**DO NOT** create or edit notebooks, workspace files, .yaml files, or cortex_project folders.

**DO NOT** create legacy notebook objects (CREATE NOTEBOOK).

**DO NOT** modify any source files in this pack.

If a step fails, report the error verbatim. Do not retry with modifications.

## Instructions (run in this exact order)

Execute these 4 scripts in order. Each script's SQL is provided below — run each statement via `snowflake_sql_execute`.

### Step 1 — Run 01_setup.sql

Creates the per-user database, schemas, BRONZE views, and stages.

```sql
USE ROLE ACCOUNTADMIN;
USE WAREHOUSE HYDRAB_HOL_WH;

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

SET HOL_DB = (SELECT CONCAT('HYDRAB_HOL_', REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_')));
USE DATABASE IDENTIFIER($HOL_DB);
USE SCHEMA BRONZE;

CREATE OR REPLACE VIEW OPPORTUNITY AS SELECT * FROM BRONZE.SALESFORCE.OPPORTUNITY;
CREATE OR REPLACE VIEW ASSET AS SELECT * FROM BRONZE.SALESFORCE.ASSET;
CREATE OR REPLACE VIEW ODOS_EVENTS AS SELECT * FROM BRONZE.ODOS.EVENTS;
CREATE OR REPLACE VIEW DEFECT_EVENT AS SELECT * FROM BRONZE.SALESFORCE.DEFECT_EVENT__C;
CREATE OR REPLACE VIEW DELIVERY_TRACKING AS SELECT * FROM BRONZE.SALESFORCE.DELIVERY_TRACKING__C;
```

NOTE: If the shared `BRONZE` database doesn't exist, tell the user: "The shared BRONZE database isn't available. Ask the lab facilitator to run admin_setup.sql first."

### Step 2 — Run 02_deploy_notebooks.sql

PUTs notebook and dbt files to stages, creates the Notebook Project Object.

```sql
USE DATABASE IDENTIFIER($HOL_DB);

PUT 'file://notebooks/01_explore_data.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/02_build_silver_gold.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/03_cortex_agent.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/04_deploy_dashboard.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/05_dbt_production.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

PUT 'file://dbt_project/dbt_project.yml' @PUBLIC.DBT_STAGE/hydrab_fleet/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/profiles.yml' @PUBLIC.DBT_STAGE/hydrab_fleet/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/schema.yml' @PUBLIC.DBT_STAGE/hydrab_fleet/models/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/staging/stg_vehicles.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/staging/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/staging/stg_telemetry.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/staging/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/staging/stg_defects.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/staging/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/staging/stg_deliveries.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/staging/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/marts/dim_vehicle.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/marts/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/marts/fct_fleet_health.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/marts/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://dbt_project/models/marts/fct_delivery_pipeline.sql' @PUBLIC.DBT_STAGE/hydrab_fleet/models/marts/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
```

Then create the NPO:
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

Run all 5 notebooks headlessly in container runtime:

```sql
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/01_explore_data.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/02_build_silver_gold.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/03_cortex_agent.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/04_deploy_dashboard.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/05_dbt_production.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';
```

Run each EXECUTE NOTEBOOK PROJECT statement one at a time. If one fails, report the error and continue with the next.

### Step 4 — Verify and report

```sql
USE DATABASE IDENTIFIER($HOL_DB);

-- Row counts
SELECT 'BRONZE.ASSET' as tbl, COUNT(*) as rows FROM BRONZE.ASSET
UNION ALL SELECT 'SILVER.VEHICLES_SILVER', COUNT(*) FROM SILVER.VEHICLES_SILVER
UNION ALL SELECT 'GOLD.DIM_VEHICLE', COUNT(*) FROM GOLD.DIM_VEHICLE
UNION ALL SELECT 'GOLD.FCT_LATEST_TELEMETRY', COUNT(*) FROM GOLD.FCT_LATEST_TELEMETRY;

-- Dashboard URL
SHOW ENDPOINTS IN SERVICE GOLD.DASHBOARD_SERVICE;

-- Semantic View + Agent
SHOW SEMANTIC VIEWS IN SCHEMA GOLD;
SHOW AGENTS IN SCHEMA GOLD;

-- dbt Project
SHOW DBT PROJECTS IN SCHEMA GOLD;
```

## Final Report

After all steps, report to the user:

1. **Data Pipeline** — Row counts for each layer
2. **Dashboard** — The ingress_url from SHOW ENDPOINTS (tell user to open in browser)
3. **Cortex Agent** — Confirm FLEET_AGENT exists, suggest sample questions:
   - "How many vehicles does each customer operate?"
   - "Which vehicles have battery SOC below 20%?"
   - "What are the most common defect types?"
4. **dbt Project** — Confirm HYDRAB_FLEET_DBT exists and ran successfully
5. **Interactive Notebooks** — Tell the user:

> **To explore the notebooks interactively:**
> 1. Go to **Workspaces** → **+ Add new** → **From Git repository**
> 2. URL: `https://github.com/nele-huvaere/hydrab-hol.git`
> 3. API Integration: **HYDRAB_GIT_INTEGRATION**
> 4. Authentication: **Public repository** → **Create**

## Phase 2: Extend with CoCo Desktop

After the lab, users open the `react-app/` folder in Cortex Code Desktop:

1. **Add pages** — Delivery Tracking, Defects heatmap
2. **Connect live queries** — Replace static data with Snowflake queries
3. **Add Agent chat** — Embed the Cortex Agent in the dashboard
4. **Improve the map** — Color by SOC, add route history
5. **Rebuild and deploy** — `docker build`, push, `ALTER SERVICE`

## Hard constraints

- Do not touch any database other than `HYDRAB_HOL_<USER>`.
- `BRONZE` (shared database) is **read-only** — never write to it.
- Use warehouse `HYDRAB_HOL_WH` everywhere.
- Always derive the user namespace from `CURRENT_USER()`.
- Do not modify notebooks or files in this pack at runtime.

## Data Architecture

```
BRONZE (Shared, read-only)
├── SALESFORCE: OPPORTUNITY, ASSET, DEFECT_EVENT__C, DELIVERY_TRACKING__C
└── ODOS: EVENTS (raw telemetry JSON)

SILVER (Dynamic Tables, 5-min lag)
├── VEHICLES_SILVER, TELEMETRY_SILVER, DEFECTS_SILVER

GOLD (Views + AI)
├── DIM_VEHICLE, FCT_LATEST_TELEMETRY, FCT_DEFECT
├── FLEET_SEMANTIC (Semantic View)
├── FLEET_AGENT (Cortex Agent)
└── DASHBOARD_SERVICE (SPCS)
```

## Account Details

- Account: `sfseeurope-nhuvaere_azure1`
- BRONZE Share from: `GXNIMKH.HV05860`
- Compute Pool: `HYDRAB_HOL_POOL`
- Image Repo: `HYDRAB_HOL_SHARED.PUBLIC.IMAGE_REPO`
- Git Integration: `HYDRAB_GIT_INTEGRATION`
