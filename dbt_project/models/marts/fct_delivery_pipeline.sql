-- Mart: Delivery pipeline summary
-- Groups deliveries by status for funnel visualization

SELECT
    delivery_status,
    COUNT(*) AS vehicle_count,
    COUNT(DISTINCT asset_id) AS unique_assets
FROM {{ ref('stg_deliveries') }}
GROUP BY delivery_status
ORDER BY vehicle_count DESC
