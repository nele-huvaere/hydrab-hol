-- Staging model: clean defect events from Salesforce
-- Source: BRONZE.DEFECT_EVENT (shared from Salesforce CRM)

SELECT
    "Asset__c" AS asset_id,
    "Defect_Type__c" AS defect_type,
    "Severity__c" AS severity,
    "Root_Cause__c" AS root_cause,
    "Repair_Cost__c" AS repair_cost,
    "CreatedDate" AS created_date
FROM {{ source('bronze', 'DEFECT_EVENT') }}
