-- Mart: Vehicle dimension table
-- Combines vehicle master with latest telemetry for a 360 view

WITH latest_telemetry AS (
    SELECT *
    FROM {{ ref('stg_telemetry') }}
    QUALIFY ROW_NUMBER() OVER (PARTITION BY vin ORDER BY event_time DESC) = 1
)

SELECT
    v.vin,
    v.model,
    v.customer_id,
    v.depot,
    v.status,
    v.delivery_status,
    v.delivery_date,
    t.battery_soc AS latest_soc,
    t.speed_kmh AS latest_speed,
    t.latitude AS last_lat,
    t.longitude AS last_lng,
    t.event_time AS last_seen
FROM {{ ref('stg_vehicles') }} v
LEFT JOIN latest_telemetry t ON v.vin = t.vin
