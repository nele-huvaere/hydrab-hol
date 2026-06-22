-- ============================================================================
-- HydraB HOL — Step 2: Deploy notebooks and dbt files
--
-- Run AFTER 01_setup.sql. Fully idempotent.
-- For each .ipynb file: PUTs to the notebook stage.
-- For dbt files: PUTs to the dbt stage.
-- Creates a Notebook Project Object (NPO) from the notebook stage.
-- ============================================================================

USE ROLE ACCOUNTADMIN;
USE WAREHOUSE HYDRAB_HOL_WH;
SET HOL_USER = (SELECT REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_'));
SET HOL_DB   = (SELECT CONCAT('HYDRAB_HOL_', $HOL_USER));
USE DATABASE IDENTIFIER($HOL_DB);

-- ---------------------------------------------------------------------------
-- Upload notebooks to stage
-- CoCo resolves file:// paths relative to the skill folder root.
-- ---------------------------------------------------------------------------
PUT 'file://notebooks/01_explore_data.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/02_build_silver_gold.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/03_cortex_agent.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/04_deploy_dashboard.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file://notebooks/05_dbt_production.ipynb' @PUBLIC.NOTEBOOK_STAGE/notebooks/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

-- ---------------------------------------------------------------------------
-- Upload dbt project files to dbt stage
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Create Notebook Project Object from the notebook stage
-- ---------------------------------------------------------------------------
EXECUTE IMMEDIATE
$$
DECLARE
    db STRING DEFAULT $HOL_DB;
BEGIN
    EXECUTE IMMEDIATE 'CREATE OR REPLACE NOTEBOOK PROJECT ' || :db || '.PUBLIC.HYDRAB_PROJECT FROM ''@' || :db || '.PUBLIC.NOTEBOOK_STAGE''';
    RETURN 'Notebook Project created: ' || :db || '.PUBLIC.HYDRAB_PROJECT';
END;
$$;

-- Confirm: list files in the stage
LS @PUBLIC.NOTEBOOK_STAGE/notebooks/;
