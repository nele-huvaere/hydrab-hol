-- ============================================================================
-- HydraB HOL — Step 4: Verify everything works
--
-- Run AFTER 03_execute_notebooks.sql.
-- Checks row counts, service endpoints, semantic views, agents, dbt.
-- ============================================================================

USE ROLE ACCOUNTADMIN;
USE WAREHOUSE HYDRAB_HOL_WH;
SET HOL_USER = (SELECT REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_'));
SET HOL_DB   = (SELECT CONCAT('HYDRAB_HOL_', $HOL_USER));
USE DATABASE IDENTIFIER($HOL_DB);

-- ---------------------------------------------------------------------------
-- 1. Row counts across all layers
-- ---------------------------------------------------------------------------
SELECT 'BRONZE.ASSET' as layer_table, COUNT(*) as rows FROM BRONZE.ASSET
UNION ALL SELECT 'BRONZE.ODOS_EVENTS', COUNT(*) FROM BRONZE.ODOS_EVENTS
UNION ALL SELECT 'BRONZE.OPPORTUNITY', COUNT(*) FROM BRONZE.OPPORTUNITY
UNION ALL SELECT 'BRONZE.DEFECT_EVENT', COUNT(*) FROM BRONZE.DEFECT_EVENT
UNION ALL SELECT 'SILVER.VEHICLES_SILVER', COUNT(*) FROM SILVER.VEHICLES_SILVER
UNION ALL SELECT 'SILVER.TELEMETRY_SILVER', COUNT(*) FROM SILVER.TELEMETRY_SILVER
UNION ALL SELECT 'SILVER.DEFECTS_SILVER', COUNT(*) FROM SILVER.DEFECTS_SILVER
UNION ALL SELECT 'GOLD.DIM_VEHICLE', COUNT(*) FROM GOLD.DIM_VEHICLE
UNION ALL SELECT 'GOLD.FCT_LATEST_TELEMETRY', COUNT(*) FROM GOLD.FCT_LATEST_TELEMETRY
UNION ALL SELECT 'GOLD.FCT_DEFECT', COUNT(*) FROM GOLD.FCT_DEFECT;

-- ---------------------------------------------------------------------------
-- 2. Dashboard service endpoint
-- ---------------------------------------------------------------------------
SHOW ENDPOINTS IN SERVICE GOLD.DASHBOARD_SERVICE;

-- ---------------------------------------------------------------------------
-- 3. Semantic View and Cortex Agent
-- ---------------------------------------------------------------------------
SHOW SEMANTIC VIEWS IN SCHEMA GOLD;
SHOW AGENTS IN SCHEMA GOLD;

-- ---------------------------------------------------------------------------
-- 4. dbt Project
-- ---------------------------------------------------------------------------
SHOW DBT PROJECTS IN SCHEMA GOLD;

-- ---------------------------------------------------------------------------
-- 5. Notebook Project
-- ---------------------------------------------------------------------------
SHOW NOTEBOOK PROJECTS IN SCHEMA PUBLIC;

-- ---------------------------------------------------------------------------
-- Summary: report to user
-- ---------------------------------------------------------------------------
SELECT 'VERIFICATION COMPLETE' AS STATUS,
       $HOL_DB AS DATABASE,
       'Open Workspaces > From Git repo > https://github.com/nele-huvaere/hydrab-hol.git' AS NOTEBOOKS,
       'Check SHOW ENDPOINTS output above for dashboard URL' AS DASHBOARD;
