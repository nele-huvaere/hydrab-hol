/*
=============================================================================
  HYDRAB HOL — ADMIN PRE-SETUP SCRIPT
  
  Run this ONCE as ACCOUNTADMIN before the Hands-On Lab.
  This creates all shared infrastructure that participants need.
  
  Account: sfseeurope-nhuvaere_azure1
  Run by: Nele Huvaere (lab facilitator)
=============================================================================
*/

USE ROLE ACCOUNTADMIN;

-- 1. Create shared database for lab infrastructure
CREATE DATABASE IF NOT EXISTS HYDRAB_HOL_SHARED;
USE DATABASE HYDRAB_HOL_SHARED;
CREATE SCHEMA IF NOT EXISTS PUBLIC;

-- 2. Create the inbound share (BRONZE data from Jaco's trial account)
-- This should already exist if the share was set up previously
-- CREATE DATABASE IF NOT EXISTS HYDRAB_BRONZE_SHARED
--   FROM SHARE GXNIMKH.HV05860.HYDRAB_BRONZE_SHARE;

-- 3. Create compute pool for SPCS services
CREATE COMPUTE POOL IF NOT EXISTS HYDRAB_HOL_POOL
  MIN_NODES = 1
  MAX_NODES = 3
  INSTANCE_FAMILY = CPU_X64_XS
  AUTO_SUSPEND_SECS = 300
  AUTO_RESUME = TRUE;

-- 4. Create image repository
CREATE IMAGE REPOSITORY IF NOT EXISTS HYDRAB_HOL_SHARED.PUBLIC.IMAGE_REPO;

-- 5. Create warehouse
CREATE WAREHOUSE IF NOT EXISTS HYDRAB_HOL_WH
  WAREHOUSE_SIZE = 'X-SMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE;

-- 6. Enable cross-region inference for Cortex AI
ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION';

-- 7. Create Git API integration for Workspaces (public repo, no auth needed)
CREATE OR REPLACE API INTEGRATION HYDRAB_GIT_INTEGRATION
  API_PROVIDER = git_https_api
  API_ALLOWED_PREFIXES = ('https://github.com/nele-huvaere')
  ENABLED = TRUE;

GRANT USAGE ON INTEGRATION HYDRAB_GIT_INTEGRATION TO ROLE PUBLIC;

-- 9. External Access Integration for public API calls (weather enrichment)
USE DATABASE HYDRAB_HOL_SHARED;
CREATE OR REPLACE NETWORK RULE PUBLIC.HYDRAB_OPEN_METEO_RULE
  MODE = EGRESS
  TYPE = HOST_PORT
  VALUE_LIST = ('api.open-meteo.com:443');

CREATE OR REPLACE EXTERNAL ACCESS INTEGRATION HYDRAB_EXTERNAL_API
  ALLOWED_NETWORK_RULES = (HYDRAB_HOL_SHARED.PUBLIC.HYDRAB_OPEN_METEO_RULE)
  ENABLED = TRUE;

GRANT USAGE ON INTEGRATION HYDRAB_EXTERNAL_API TO ROLE PUBLIC;

-- 10. Grant participants access (grant to PUBLIC so all users can use)
GRANT USAGE ON DATABASE HYDRAB_HOL_SHARED TO ROLE PUBLIC;
GRANT USAGE ON SCHEMA HYDRAB_HOL_SHARED.PUBLIC TO ROLE PUBLIC;
GRANT READ ON IMAGE REPOSITORY HYDRAB_HOL_SHARED.PUBLIC.IMAGE_REPO TO ROLE PUBLIC;
GRANT USAGE ON COMPUTE POOL HYDRAB_HOL_POOL TO ROLE PUBLIC;
GRANT USAGE ON WAREHOUSE HYDRAB_HOL_WH TO ROLE PUBLIC;

-- Grant access to the shared BRONZE database (from inbound share)
GRANT IMPORTED PRIVILEGES ON DATABASE BRONZE TO ROLE PUBLIC;

-- 8. Show the image repository URL (needed for Docker push)
SHOW IMAGE REPOSITORIES IN SCHEMA HYDRAB_HOL_SHARED.PUBLIC;
-- Copy the repository_url from the output for the Docker push command

/*
=============================================================================
  AFTER RUNNING THIS SQL:
  
  Push the Docker image (use key-pair auth if MFA is enforced):
  
  1. Set up key-pair auth in ~/.snowflake/connections.toml:
     [nhuvaere_azure1_keypair]
     account = "SFSEEUROPE-NHUVAERE_AZURE1"
     user = "NHUVAERE"
     authenticator = "SNOWFLAKE_JWT"
     private_key_file = "/path/to/snowflake_key.p8"
  
  2. snow spcs image-registry login --connection nhuvaere_azure1_keypair
  
  3. docker build --platform linux/amd64 -t sfseeurope-nhuvaere-azure1.registry.snowflakecomputing.com/hydrab_hol_shared/public/image_repo/hydrab-dashboard:v1 ./react-app
  
  4. docker push sfseeurope-nhuvaere-azure1.registry.snowflakecomputing.com/hydrab_hol_shared/public/image_repo/hydrab-dashboard:v1
  
  Verify:
  SELECT SYSTEM$REGISTRY_LIST_IMAGES('/HYDRAB_HOL_SHARED/PUBLIC/IMAGE_REPO');
  
  STATUS: Image pushed successfully (2025-06-22)
=============================================================================
*/
