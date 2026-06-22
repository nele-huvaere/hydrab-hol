-- ============================================================================
-- HydraB HOL — Step 1: Per-attendee setup
--
-- Run this script first. Fully idempotent and safe to re-run.
-- Creates everything each attendee needs:
--   - one database HYDRAB_HOL_<USER>
--   - schemas: BRONZE, SILVER, GOLD, PUBLIC
--   - BRONZE tables (copied from shared data, enabling change tracking)
--   - warehouse
--   - internal stages for notebooks and dbt files
--
-- WHY COPY? Dynamic Tables require change tracking on their sources.
-- Shared/imported databases don't support change tracking.
-- We copy once into native tables so Dynamic Tables work.
-- In the trial account, data is already native — this script still works.
-- ============================================================================

USE ROLE ACCOUNTADMIN;
USE WAREHOUSE HYDRAB_HOL_WH;

-- 1. Create per-user database and schemas
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

-- 2. Switch into user namespace
SET HOL_USER = (SELECT REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_'));
SET HOL_DB   = (SELECT CONCAT('HYDRAB_HOL_', $HOL_USER));
USE DATABASE IDENTIFIER($HOL_DB);
USE SCHEMA BRONZE;

-- 3. Copy BRONZE data into native tables (enables change tracking for Dynamic Tables)
-- Source: BRONZE database (either shared/imported or native in trial account)
CREATE OR REPLACE TABLE ASSET AS
  SELECT * FROM BRONZE.SALESFORCE.ASSET;

CREATE OR REPLACE TABLE OPPORTUNITY AS
  SELECT * FROM BRONZE.SALESFORCE.OPPORTUNITY;

CREATE OR REPLACE TABLE ODOS_EVENTS AS
  SELECT * FROM BRONZE.ODOS.EVENTS;

CREATE OR REPLACE TABLE DEFECT_EVENT AS
  SELECT * FROM BRONZE.SALESFORCE.DEFECT_EVENT__C;

CREATE OR REPLACE TABLE DELIVERY_TRACKING AS
  SELECT * FROM BRONZE.SALESFORCE.DELIVERY_TRACKING__C;

-- 4. Enable change tracking on BRONZE tables (required for Dynamic Tables)
ALTER TABLE ASSET SET CHANGE_TRACKING = TRUE;
ALTER TABLE ODOS_EVENTS SET CHANGE_TRACKING = TRUE;
ALTER TABLE DEFECT_EVENT SET CHANGE_TRACKING = TRUE;

-- 5. Confirmation
SELECT $HOL_USER AS YOUR_NAMESPACE,
       $HOL_DB   AS YOUR_DATABASE,
       (SELECT COUNT(*) FROM BRONZE.ASSET) AS ASSET_ROWS,
       (SELECT COUNT(*) FROM BRONZE.ODOS_EVENTS) AS TELEMETRY_ROWS,
       'Run 02_deploy_notebooks.sql next' AS NEXT_STEP;
