-- Staging model: parse Odos telemetry JSON into typed columns
-- Source: BRONZE.ODOS_EVENTS (shared from Odos Telemetry API)

SELECT
    RAW:vin::STRING AS vin,
    RAW:timestamp::TIMESTAMP AS event_time,
    RAW:signals:battery_soc::FLOAT AS battery_soc,
    RAW:signals:speed::FLOAT AS speed_kmh,
    RAW:signals:battery_temperature::FLOAT AS cell_temp,
    RAW:signals:latitude::FLOAT AS latitude,
    RAW:signals:longitude::FLOAT AS longitude,
    RAW:signals:odometer::FLOAT AS odometer_km,
    RAW:signals:energy_consumed::FLOAT AS energy_kwh
FROM {{ source('bronze', 'ODOS_EVENTS') }}
