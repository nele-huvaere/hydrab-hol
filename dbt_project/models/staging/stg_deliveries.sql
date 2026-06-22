-- Staging model: delivery tracking from Salesforce
-- Source: BRONZE.DELIVERY_TRACKING (shared from Salesforce CRM)

SELECT
    "Name" AS tracking_id,
    "Asset__c" AS asset_id,
    "Status__c" AS delivery_status,
    "Location__c" AS current_location,
    "Estimated_Arrival__c" AS eta,
    "CreatedDate" AS created_date
FROM {{ source('bronze', 'DELIVERY_TRACKING') }}
