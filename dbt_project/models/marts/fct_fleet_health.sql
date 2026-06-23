-- Mart: Fleet health summary per depot
-- Aggregates telemetry + defects at depot level for fleet managers

SELECT
    v.depot,
    v.customer_id,
    COUNT(DISTINCT v.vin) AS total_vehicles,
    AVG(v.latest_soc) AS avg_battery_soc,
    COUNT_IF(v.latest_soc < 20) AS low_battery_vehicles,
    d.total_defect_events
FROM {{ ref('dim_vehicle') }} v
LEFT JOIN (
    SELECT
        defect_id,
        COUNT(*) AS total_defect_events
    FROM {{ ref('stg_defects') }}
    GROUP BY defect_id
) d ON 1=1
GROUP BY v.depot, v.customer_id, d.total_defect_events
