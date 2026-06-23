-- Mart: Delivery pipeline summary
-- Groups deliveries by transport type for pipeline visualization

SELECT
    transport_type,
    COUNT(*) AS delivery_count,
    COUNT(DISTINCT asset_id) AS unique_assets
FROM {{ ref('stg_deliveries') }}
GROUP BY transport_type
ORDER BY delivery_count DESC
