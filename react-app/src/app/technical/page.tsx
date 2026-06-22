'use client'

export default function TechnicalPage() {
  return (
    <main className="container">
      <h1 className="page-title">Technical Architecture</h1>
      <p className="page-subtitle">How this app connects to Snowflake, what data sources are used, and which functions power the backend</p>

      {/* Architecture Overview */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Architecture Overview</div>
        <div style={{ padding: '24px 28px', lineHeight: 1.8, fontSize: 14 }}>
          <div className="tech-diagram">
            <div className="tech-diagram-row">
              <div className="tech-box tech-box-green">React / Next.js Frontend</div>
              <div className="tech-arrow">→</div>
              <div className="tech-box tech-box-blue">Next.js API Routes</div>
              <div className="tech-arrow">→</div>
              <div className="tech-box tech-box-snow">Snowflake (SQL + Cortex)</div>
            </div>
          </div>
          <p style={{ marginTop: 20, color: '#555' }}>
            The app uses a <strong>pre-queried static data</strong> pattern for the demo. In production, the API routes
            would make live calls to Snowflake using the <code>snowflake-sdk</code> Node.js connector or the Snowflake REST API.
            The Chat panel calls the <strong>Cortex Agent</strong> endpoint to answer natural-language questions about the fleet.
          </p>
        </div>
      </div>

      {/* Data Sources */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Data Sources</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Source System</th>
                <th>Snowflake Database</th>
                <th>Schema</th>
                <th>What it Contains</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Salesforce CRM</strong></td>
                <td>HYDRAB_HOL_NHUVAERE</td>
                <td>BRONZE (inbound share)</td>
                <td>Opportunities, Accounts, Contacts, Deliveries</td>
              </tr>
              <tr>
                <td><strong>Odos Telemetry API</strong></td>
                <td>HYDRAB_HOL_NHUVAERE</td>
                <td>BRONZE → SILVER</td>
                <td>Real-time vehicle GPS, SOC, temperature, speed</td>
              </tr>
              <tr>
                <td><strong>Derived / Gold</strong></td>
                <td>HYDRAB_HOL_NHUVAERE</td>
                <td>GOLD</td>
                <td>Aggregated views for dashboards and the agent</td>
              </tr>
              <tr>
                <td><strong>Synthetic (Demo)</strong></td>
                <td>HYDRAB_HOL_NHUVAERE</td>
                <td>SYNTHETIC</td>
                <td>Generated demo data for telemetry history</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: 24, fontSize: 15, fontWeight: 600 }}>Key Tables Used</h3>
          <table className="tech-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Table</th>
                <th>Rows</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>OPPORTUNITY</code></td><td>1,056</td><td>Sales pipeline deals (stages, amounts, regions)</td></tr>
              <tr><td><code>ASSET</code></td><td>42,884</td><td>Vehicle master data (VIN, model, customer, depot)</td></tr>
              <tr><td><code>ASSET_LOCATION_HISTORY__C</code></td><td>1.85M</td><td>GPS location pings for fleet tracking</td></tr>
              <tr><td><code>DEFECT_EVENT__C</code></td><td>47,813</td><td>Vehicle defect reports and maintenance events</td></tr>
              <tr><td><code>DELIVERY_TRACKING__C</code></td><td>6,621</td><td>Delivery status and logistics tracking</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Snowflake Functions & Features */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Snowflake Functions & Features Used</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Feature / Function</th>
                <th>Where Used</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cortex Agent</strong></td>
                <td>Chat Panel → <code>/api/agent</code></td>
                <td>Natural-language Q&A over fleet data using <code>HYDRAB_HOL_NHUVAERE.GOLD.HYDRAB_FLEET_AGENT</code></td>
              </tr>
              <tr>
                <td><strong>Data Sharing (Inbound)</strong></td>
                <td>BRONZE schema</td>
                <td>Salesforce data shared from account <code>GXNIMKH.HV05860</code> via Snowflake secure share</td>
              </tr>
              <tr>
                <td><strong>Snowflake SQL Aggregations</strong></td>
                <td>Pipeline, Delivery, Fleet pages</td>
                <td><code>GROUP BY</code>, <code>COUNT</code>, <code>SUM</code> on opportunity stages, delivery statuses, depot counts</td>
              </tr>
              <tr>
                <td><strong>Dynamic Tables / Views</strong></td>
                <td>GOLD schema</td>
                <td>Pre-aggregated Gold layer views that power API responses</td>
              </tr>
              <tr>
                <td><strong>Geospatial (ST_ functions)</strong></td>
                <td>Fleet Map</td>
                <td><code>ST_POINT</code>, coordinate extraction from <code>ASSET_LOCATION_HISTORY__C</code></td>
              </tr>
              <tr>
                <td><strong>Warehouse: HYDRAB_HOL_WH</strong></td>
                <td>All queries</td>
                <td>XS warehouse for compute — auto-suspend/resume for cost efficiency</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fields Used Per Page */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Fields Used Per Page</div>
        <div style={{ padding: '24px 28px' }}>
          <div className="tech-section">
            <h3>Overview Dashboard</h3>
            <ul className="tech-field-list">
              <li><code>OPPORTUNITY.StageName</code> — pipeline funnel stages</li>
              <li><code>OPPORTUNITY.Amount</code> — deal values in £</li>
              <li><code>DELIVERY_TRACKING__C.Status__c</code> — delivery status breakdown</li>
              <li><code>ASSET_LOCATION_HISTORY__C.Latitude__c / Longitude__c</code> — fleet map pins</li>
            </ul>
          </div>

          <div className="tech-section">
            <h3>Fleet Map</h3>
            <ul className="tech-field-list">
              <li><code>ASSET.Id</code> — vehicle identifier</li>
              <li><code>ASSET_LOCATION_HISTORY__C.Latitude__c</code> — GPS lat</li>
              <li><code>ASSET_LOCATION_HISTORY__C.Longitude__c</code> — GPS lon</li>
              <li><code>ASSET.Depot__c</code> — depot assignment</li>
              <li><code>ASSET.Status</code> — deployed / in_transit / charging</li>
            </ul>
          </div>

          <div className="tech-section">
            <h3>Pipeline</h3>
            <ul className="tech-field-list">
              <li><code>OPPORTUNITY.Name</code> — deal name</li>
              <li><code>OPPORTUNITY.StageName</code> — current pipeline stage</li>
              <li><code>OPPORTUNITY.Amount</code> — deal value</li>
              <li><code>OPPORTUNITY.CloseDate</code> — expected close</li>
              <li><code>OPPORTUNITY.Region__c</code> — geographic region</li>
              <li><code>OPPORTUNITY.Territory2Id</code> — territory mapping</li>
              <li><code>OPPORTUNITY.Number_of_Assets__c</code> — vehicles in order</li>
            </ul>
          </div>

          <div className="tech-section">
            <h3>Vehicle Detail (Telemetry)</h3>
            <ul className="tech-field-list">
              <li><code>ASSET.Name</code> — vehicle fleet number</li>
              <li><code>ASSET.VIN__c</code> — Vehicle Identification Number</li>
              <li><code>Telemetry: SOC (State of Charge %)</code> — battery level</li>
              <li><code>Telemetry: Battery_Temp_C</code> — thermal monitoring</li>
              <li><code>Telemetry: Speed_kmh</code> — current speed</li>
              <li><code>Telemetry: Energy_Consumed_kWh</code> — charge session data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Route Details */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">API Routes & Snowflake Calls</div>
        <div style={{ padding: '24px 28px' }}>
          <p style={{ color: '#555', marginBottom: 16, fontSize: 13 }}>
            Each API route pre-queries Snowflake data. In production, these would execute live SQL via the Snowflake Node.js SDK.
          </p>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Method</th>
                <th>Source Query (Snowflake SQL)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>/api/fleet-map</code></td>
                <td>GET</td>
                <td>
                  <code className="tech-sql">SELECT a.Id, alh.Latitude__c, alh.Longitude__c, a.Depot__c, a.Status FROM ASSET a JOIN ASSET_LOCATION_HISTORY__C alh ON a.Id = alh.Asset__c WHERE alh.CreatedDate = (SELECT MAX(CreatedDate) ...)</code>
                </td>
              </tr>
              <tr>
                <td><code>/api/fleet-by-depot</code></td>
                <td>GET</td>
                <td>
                  <code className="tech-sql">SELECT Depot__c AS DEPOT, City__c AS CITY, COUNT(*) AS VEHICLE_COUNT, SUM(CASE WHEN Status=&apos;Deployed&apos; THEN 1 END) AS DEPLOYED FROM ASSET GROUP BY 1, 2</code>
                </td>
              </tr>
              <tr>
                <td><code>/api/pipeline-funnel</code></td>
                <td>GET</td>
                <td>
                  <code className="tech-sql">SELECT StageName AS stage, COUNT(*) AS count, SUM(Amount) AS amount, COUNT(DISTINCT AccountId) AS customers FROM OPPORTUNITY GROUP BY StageName</code>
                </td>
              </tr>
              <tr>
                <td><code>/api/opportunities</code></td>
                <td>GET</td>
                <td>
                  <code className="tech-sql">SELECT Name, StageName, Amount, CloseDate, Region__c, Number_of_Assets__c FROM OPPORTUNITY WHERE Amount &gt; 10000000 ORDER BY Amount DESC LIMIT 10</code>
                </td>
              </tr>
              <tr>
                <td><code>/api/delivery-status</code></td>
                <td>GET</td>
                <td>
                  <code className="tech-sql">SELECT Status__c AS status, COUNT(*) AS count FROM DELIVERY_TRACKING__C GROUP BY Status__c ORDER BY count DESC</code>
                </td>
              </tr>
              <tr>
                <td><code>/api/telemetry-history</code></td>
                <td>GET</td>
                <td>
                  <code className="tech-sql">SELECT TIME_SLICE(timestamp, 30, &apos;MINUTE&apos;) AS time, AVG(soc) AS soc, AVG(battery_temp) AS temp, AVG(speed) AS speed FROM TELEMETRY WHERE asset_id = ? AND DATE = CURRENT_DATE() GROUP BY 1</code>
                </td>
              </tr>
              <tr>
                <td><code>/api/agent</code></td>
                <td>POST</td>
                <td>
                  <code className="tech-sql">POST /api/v2/cortex/agent:run → HYDRAB_FLEET_AGENT (Cortex Agent with semantic model over GOLD schema)</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* How the Cortex Agent Works */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">How the Cortex Agent Call Works</div>
        <div style={{ padding: '24px 28px', lineHeight: 1.8, fontSize: 14 }}>
          <div className="tech-steps">
            <div className="tech-step">
              <div className="tech-step-num">1</div>
              <div className="tech-step-content">
                <strong>User types a question</strong> in the Chat Panel (e.g. &ldquo;How many vehicles per customer?&rdquo;)
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">2</div>
              <div className="tech-step-content">
                <strong>Frontend sends POST</strong> to <code>/api/agent</code> with <code>{`{ "question": "..." }`}</code>
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">3</div>
              <div className="tech-step-content">
                <strong>API route calls Snowflake Cortex Agent</strong> at <code>HYDRAB_HOL_NHUVAERE.GOLD.HYDRAB_FLEET_AGENT</code>
                <div style={{ marginTop: 8, padding: '12px 16px', background: '#f8f9fa', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}>
                  POST https://&lt;account&gt;.snowflakecomputing.com/api/v2/cortex/agent:run<br/>
                  {`{ "model": "...", "agent_name": "HYDRAB_FLEET_AGENT", "messages": [...] }`}
                </div>
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">4</div>
              <div className="tech-step-content">
                <strong>Cortex Agent processes the question:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  <li>Uses a Semantic Model to understand the data schema</li>
                  <li>Generates SQL against GOLD tables</li>
                  <li>Executes the query on HYDRAB_HOL_WH</li>
                  <li>Formats the result as natural language</li>
                </ul>
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">5</div>
              <div className="tech-step-content">
                <strong>Response returned</strong> to the chat panel and displayed to the user
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production vs Demo */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Demo vs. Production Mode</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>This Demo</th>
                <th>Production</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data</td>
                <td>Static JSON in API routes (pre-queried snapshots)</td>
                <td>Live SQL queries via <code>snowflake-sdk</code></td>
              </tr>
              <tr>
                <td>Auth</td>
                <td>None (localhost demo)</td>
                <td>Snowflake OAuth / key-pair JWT</td>
              </tr>
              <tr>
                <td>Agent</td>
                <td>Keyword-matched mock responses</td>
                <td>Live Cortex Agent REST API call</td>
              </tr>
              <tr>
                <td>Refresh</td>
                <td>Page load only</td>
                <td>WebSocket / polling for real-time telemetry</td>
              </tr>
              <tr>
                <td>Hosting</td>
                <td>Local Next.js dev server</td>
                <td>Streamlit in Snowflake or SPCS container</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Snowflake Account Info */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Snowflake Account Details</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Account</td><td><code>SFSEEUROPE-NHUVAERE_AZURE1</code></td></tr>
              <tr><td>Database</td><td><code>HYDRAB_HOL_NHUVAERE</code></td></tr>
              <tr><td>Warehouse</td><td><code>HYDRAB_HOL_WH</code> (X-Small)</td></tr>
              <tr><td>Role</td><td><code>ACCOUNTADMIN</code></td></tr>
              <tr><td>Agent</td><td><code>HYDRAB_HOL_NHUVAERE.GOLD.HYDRAB_FLEET_AGENT</code></td></tr>
              <tr><td>BRONZE Share</td><td>Inbound from <code>GXNIMKH.HV05860</code></td></tr>
              <tr><td>Schemas</td><td><code>BRONZE</code> → <code>SILVER</code> → <code>GOLD</code> + <code>SYNTHETIC</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
