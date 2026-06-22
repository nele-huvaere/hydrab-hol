-- ============================================================================
-- HydraB HOL — Step 1: Per-attendee setup
--
-- Run this script first. Fully idempotent and safe to re-run.
-- Creates everything each attendee needs:
--   - one database HYDRAB_HOL_<USER>
--   - schemas: BRONZE, SILVER, GOLD, PUBLIC
--   - BRONZE views pointing to shared data
--   - warehouse
--   - internal stages for notebooks and dbt files
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

    -- Stages for notebook deployment and dbt files
    EXECUTE IMMEDIATE 'CREATE STAGE IF NOT EXISTS ' || :hol_db || '.PUBLIC.NOTEBOOK_STAGE DIRECTORY=(ENABLE=TRUE)';
    EXECUTE IMMEDIATE 'CREATE STAGE IF NOT EXISTS ' || :hol_db || '.PUBLIC.DBT_STAGE DIRECTORY=(ENABLE=TRUE)';

    RETURN 'Setup complete: ' || :hol_db;
END;
$$;

-- 2. Switch into user namespace
SET HOL_USER = (SELECT REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_'));
SET HOL_DB   = (SELECT CONCAT('HYDRAB_HOL_', $HOL_USER));
USE DATABASE IDENTIFIER($HOL_DB);

-- 3. Create BRONZE views pointing to shared data
USE SCHEMA BRONZE;

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

-- 4. Confirmation
SELECT $HOL_USER AS YOUR_NAMESPACE,
       $HOL_DB   AS YOUR_DATABASE,
       'Run 02_deploy_notebooks.sql next' AS NEXT_STEP;
