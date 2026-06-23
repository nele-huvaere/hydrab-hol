-- Staging model: parse Odos telemetry JSON into typed columns
-- Source: BRONZE.ODOS_EVENTS (copied from Odos Telemetry API)
-- Note: RAW_JSON is VARCHAR, must use PARSE_JSON()

WITH parsed AS (
  SELECT
    PARSE_JSON(RAW_JSON):vin::STRING AS vin,
    PARSE_JSON(RAW_JSON):startTime::TIMESTAMP AS event_time,
    PARSE_JSON(RAW_JSON):vehicleCustomer::STRING AS customer_name,
    sig.value:name::STRING AS signal_name,
    sig.value:values[0]:value::STRING AS reading_value
  FROM {{ source('bronze', 'ODOS_EVENTS') }},
    LATERAL FLATTEN(input => PARSE_JSON(RAW_JSON):signals) sig
)
SELECT
  vin,
  event_time,
  customer_name,
  MAX(CASE WHEN signal_name = 'LOCATION' THEN SPLIT_PART(reading_value, ';', 2)::FLOAT END) AS latitude,
  MAX(CASE WHEN signal_name = 'LOCATION' THEN SPLIT_PART(reading_value, ';', 1)::FLOAT END) AS longitude,
  MAX(CASE WHEN signal_name = 'MBMSStat1_DisplayedSOC_18FFB5F3_2' THEN reading_value::FLOAT END) AS battery_soc,
  MAX(CASE WHEN signal_name ILIKE '%VehicleSpeed%' THEN reading_value::FLOAT END) AS speed_kmh,
  MAX(CASE WHEN signal_name ILIKE '%TotalVehDistance%' THEN reading_value::FLOAT END) AS odometer_km
FROM parsed
GROUP BY vin, event_time, customer_name
