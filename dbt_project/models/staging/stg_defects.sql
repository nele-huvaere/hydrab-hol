-- Staging model: clean defect events from Salesforce
-- Source: BRONZE.DEFECT_EVENT (copied from Salesforce CRM)

SELECT
    "Defect__c" AS defect_id,
    "Name" AS event_name,
    "Type__c" AS event_type,
    "Body__c" AS description,
    "Actor__c" AS actor,
    "Old_Value__c" AS old_value,
    "New_Value__c" AS new_value,
    "CreatedDate" AS created_date
FROM {{ source('bronze', 'DEFECT_EVENT') }}
WHERE "Defect__c" IS NOT NULL
