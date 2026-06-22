-- Staging model: clean vehicle master from Salesforce ASSET table
-- Source: BRONZE.ASSET (shared from Salesforce CRM)

SELECT
    "Chassis_Number__c" AS vin,
    "Product_Name__c" AS model,
    "Account_Name__c" AS customer,
    "Depot_Name__c" AS depot,
    "Status" AS status,
    "Install_Date" AS install_date
FROM {{ source('bronze', 'ASSET') }}
WHERE "Chassis_Number__c" IS NOT NULL
