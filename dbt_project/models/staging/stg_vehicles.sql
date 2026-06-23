-- Staging model: clean vehicle master from Salesforce ASSET table
-- Source: BRONZE.ASSET (copied from shared Salesforce CRM)

SELECT
    "Chassis_Number__c" AS vin,
    "Name" AS model,
    "AccountId" AS customer_id,
    "Bus_Depot__c" AS depot,
    "Status" AS status,
    "Production_Status__c" AS production_status,
    "Delivery_Status__c" AS delivery_status,
    "Delivery_Date__c" AS delivery_date
FROM {{ source('bronze', 'ASSET') }}
WHERE "Chassis_Number__c" IS NOT NULL
