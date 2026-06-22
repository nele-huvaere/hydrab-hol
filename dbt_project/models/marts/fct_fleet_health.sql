-- Mart: Fleet health summary per depot
-- Aggregates telemetry + defects at depot level for fleet managers

SELECT
    v.depot,
    v.customer,
    COUNT(DISTINCT v.vin) AS total_vehicles,
    AVG(v.latest_soc) AS avg_battery_soc,
    COUNT_IF(v.latest_soc < 20) AS low_battery_vehicles,
    MAX(v.latest_temp) AS max_temperature,
    d.total_defects,
    d.critical_defects,
    d.avg_repair_cost
FROM {{ ref('dim_vehicle') }} v
LEFT JOIN (
    SELECT
        asset_id,
        COUNT(*) AS total_defects,
        COUNT_IF(severity = 'Critical') AS critical_defects,
        AVG(repair_cost) AS avg_repair_cost
    FROM {{ ref('stg_defects') }}
    GROUP BY asset_id
) d ON v.vin = d.asset_id
GROUP BY v.depot, v.customer, d.total_defects, d.critical_defects, d.avg_repair_cost
