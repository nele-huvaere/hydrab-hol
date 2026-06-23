-- Staging model: delivery tracking from Salesforce
-- Source: BRONZE.DELIVERY_TRACKING (copied from Salesforce CRM)

SELECT
    "Name" AS tracking_id,
    "Asset__c" AS asset_id,
    "Transport_Type__c" AS transport_type,
    "Asset_Location__c" AS current_location,
    "Planned_Delivery_Date__c" AS planned_delivery_date,
    "Driver_Name__c" AS driver_name,
    "Delivery_Partner__c" AS delivery_partner,
    "CreatedDate" AS created_date
FROM {{ source('bronze', 'DELIVERY_TRACKING') }}
