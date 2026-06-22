-- ============================================================================
-- HydraB HOL — Step 3: Execute notebooks in container runtime
--
-- Run AFTER 02_deploy_notebooks.sql.
-- Executes each notebook headlessly via EXECUTE NOTEBOOK PROJECT.
-- Uses the compute pool (container runtime) for Python cells, 
-- and the warehouse for SQL pushdown.
--
-- If a notebook fails, the error is reported. Continue with the next one.
-- ============================================================================

USE ROLE ACCOUNTADMIN;
USE WAREHOUSE HYDRAB_HOL_WH;
SET HOL_USER = (SELECT REGEXP_REPLACE(UPPER(CURRENT_USER()), '[^A-Z0-9_]', '_'));
SET HOL_DB   = (SELECT CONCAT('HYDRAB_HOL_', $HOL_USER));

-- ---------------------------------------------------------------------------
-- Notebook 01: Explore data (validates BRONZE access)
-- ---------------------------------------------------------------------------
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/01_explore_data.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

-- ---------------------------------------------------------------------------
-- Notebook 02: Build SILVER Dynamic Tables + GOLD views
-- ---------------------------------------------------------------------------
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/02_build_silver_gold.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

-- ---------------------------------------------------------------------------
-- Notebook 03: Cortex Agent (Semantic View + Agent)
-- ---------------------------------------------------------------------------
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/03_cortex_agent.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

-- ---------------------------------------------------------------------------
-- Notebook 04: Deploy Dashboard (SPCS service)
-- ---------------------------------------------------------------------------
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/04_deploy_dashboard.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

-- ---------------------------------------------------------------------------
-- Notebook 05: dbt Production (optional — creates dbt project + runs it)
-- ---------------------------------------------------------------------------
EXECUTE NOTEBOOK PROJECT IDENTIFIER($HOL_DB || '.PUBLIC.HYDRAB_PROJECT')
  MAIN_FILE = 'notebooks/05_dbt_production.ipynb'
  COMPUTE_POOL = 'HYDRAB_HOL_POOL'
  QUERY_WAREHOUSE = 'HYDRAB_HOL_WH'
  RUNTIME = 'V2.2-CPU-PY3.12';

-- ---------------------------------------------------------------------------
-- Report
-- ---------------------------------------------------------------------------
SELECT 'All notebooks executed. Run 04_verify.sql next.' AS STATUS;
