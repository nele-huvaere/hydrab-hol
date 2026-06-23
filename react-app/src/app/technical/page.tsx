'use client'

export default function TechnicalPage() {
  return (
    <main className="container">
      <h1 className="page-title">Technical Architecture</h1>
      <p className="page-subtitle">How this application connects to Snowflake, what data sources power it, and which functions drive the backend</p>

      {/* Architecture Overview */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Architecture Overview</div>
        <div style={{ padding: '24px 28px', lineHeight: 1.8, fontSize: 14 }}>
          <div className="tech-diagram">
            <div className="tech-diagram-row">
              <div className="tech-box tech-box-green">React / Next.js</div>
              <div className="tech-arrow">&rarr;</div>
              <div className="tech-box tech-box-blue">API Routes</div>
              <div className="tech-arrow">&rarr;</div>
              <div className="tech-box tech-box-snow">Snowflake (SQL + Cortex)</div>
            </div>
          </div>
          <p style={{ marginTop: 20, color: '#555' }}>
            This React application runs as a container on <strong>Snowpark Container Services (SPCS)</strong> - Snowflake&apos;s managed container platform.
            The API routes query Snowflake via the Node.js SDK. The Chat panel calls the <strong>Cortex Agent</strong> endpoint for natural-language Q&amp;A over fleet data.
            External data (weather) is pulled via Open-Meteo API through a Snowflake External Access Integration.
          </p>
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0f4ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13 }}>
            <strong>Deployment:</strong> Docker image &rarr; Snowflake Image Registry &rarr; SPCS Service (CPU_X64_XS compute pool) &rarr; Ingress endpoint with Snowflake auth
          </div>
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
                <th>Integration Method</th>
                <th>Schema</th>
                <th>What it Contains</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Salesforce CRM</strong></td>
                <td>Inbound Data Share</td>
                <td>BRONZE</td>
                <td>Opportunities, Accounts, Vehicles (Assets), Deliveries</td>
              </tr>
              <tr>
                <td><strong>Odos Telemetry API</strong></td>
                <td>JSON ingestion &rarr; Dynamic Tables</td>
                <td>BRONZE &rarr; SILVER &rarr; GOLD</td>
                <td>Real-time GPS, battery SOC, cell temperature, speed</td>
              </tr>
              <tr>
                <td><strong>Open-Meteo Weather API</strong></td>
                <td>External Access Integration</td>
                <td>BRONZE</td>
                <td>Temperature, wind speed, precipitation per depot location</td>
              </tr>
              <tr>
                <td><strong>Dynamic Tables (Gold)</strong></td>
                <td>Snowflake DT (auto-refresh)</td>
                <td>GOLD</td>
                <td>Aggregated fleet health, depot metrics, pipeline summaries</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: 24, fontSize: 15, fontWeight: 600 }}>Key Tables</h3>
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
              <tr><td><code>ASSET</code></td><td>42,884</td><td>Vehicle master data (VIN, model, customer, depot, GPS)</td></tr>
              <tr><td><code>ODOS_EVENTS</code></td><td>~500K</td><td>Raw telemetry JSON (SOC, temp, speed, energy)</td></tr>
              <tr><td><code>DEFECT_EVENT__C</code></td><td>47,813</td><td>Vehicle defect reports and maintenance events</td></tr>
              <tr><td><code>DELIVERY_TRACKING__C</code></td><td>6,621</td><td>Delivery status and logistics tracking</td></tr>
              <tr><td><code>DEPOT_WEATHER</code></td><td>15</td><td>Latest weather conditions per depot (Open-Meteo)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Snowflake Features */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Snowflake Features Used</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Where Used</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cortex Agent</strong></td>
                <td>Chat Panel</td>
                <td>Natural-language Q&amp;A over fleet data with semantic model</td>
              </tr>
              <tr>
                <td><strong>Data Sharing (Inbound)</strong></td>
                <td>BRONZE schema</td>
                <td>Salesforce data shared from production account via secure share</td>
              </tr>
              <tr>
                <td><strong>Dynamic Tables</strong></td>
                <td>SILVER + GOLD schemas</td>
                <td>Auto-refreshing transformations - no ETL scheduling needed</td>
              </tr>
              <tr>
                <td><strong>External Access Integration</strong></td>
                <td>Notebooks + SPCS</td>
                <td>Secure outbound calls to Open-Meteo weather API</td>
              </tr>
              <tr>
                <td><strong>SPCS (Container Services)</strong></td>
                <td>This application</td>
                <td>Runs the React app as a managed container with ingress</td>
              </tr>
              <tr>
                <td><strong>Notebooks (NPO)</strong></td>
                <td>Data pipeline</td>
                <td>Headless execution of ETL notebooks via EXECUTE NOTEBOOK PROJECT</td>
              </tr>
              <tr>
                <td><strong>dbt Projects on Snowflake</strong></td>
                <td>Production models</td>
                <td>Governed data transformations with testing and lineage</td>
              </tr>
              <tr>
                <td><strong>Geospatial (ST_ functions)</strong></td>
                <td>Fleet Map</td>
                <td>Coordinate extraction from GPS telemetry data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* API Routes */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">API Routes</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Method</th>
                <th>Data Source</th>
                <th>Returns</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>/api/fleet-map</code></td>
                <td>GET</td>
                <td>ASSET + GPS telemetry</td>
                <td>Vehicle positions with depot and status</td>
              </tr>
              <tr>
                <td><code>/api/fleet-by-depot</code></td>
                <td>GET</td>
                <td>ASSET</td>
                <td>Vehicle counts per depot (deployed vs in-production)</td>
              </tr>
              <tr>
                <td><code>/api/fleet-health</code></td>
                <td>GET</td>
                <td>ODOS_EVENTS (telemetry)</td>
                <td>SOC distribution, per-depot battery health, vehicles needing charge</td>
              </tr>
              <tr>
                <td><code>/api/depot-weather</code></td>
                <td>GET</td>
                <td>DEPOT_WEATHER + ODOS_EVENTS</td>
                <td>Weather conditions combined with battery performance per depot</td>
              </tr>
              <tr>
                <td><code>/api/pipeline-funnel</code></td>
                <td>GET</td>
                <td>OPPORTUNITY</td>
                <td>Pipeline stages with counts and amounts</td>
              </tr>
              <tr>
                <td><code>/api/opportunities</code></td>
                <td>GET</td>
                <td>OPPORTUNITY</td>
                <td>Top 10 open opportunities by value</td>
              </tr>
              <tr>
                <td><code>/api/delivery-status</code></td>
                <td>GET</td>
                <td>DELIVERY_TRACKING__C</td>
                <td>Delivery status breakdown</td>
              </tr>
              <tr>
                <td><code>/api/telemetry-history</code></td>
                <td>GET</td>
                <td>ODOS_EVENTS</td>
                <td>Time-series SOC, temperature, speed for a vehicle</td>
              </tr>
              <tr>
                <td><code>/api/agent</code></td>
                <td>POST</td>
                <td>Cortex Agent API</td>
                <td>Natural-language answers about fleet data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cortex Agent */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">How the Cortex Agent Works</div>
        <div style={{ padding: '24px 28px', lineHeight: 1.8, fontSize: 14 }}>
          <div className="tech-steps">
            <div className="tech-step">
              <div className="tech-step-num">1</div>
              <div className="tech-step-content">
                <strong>User asks a question</strong> in the Chat Panel (e.g. &ldquo;Which depot has the most vehicles?&rdquo;)
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">2</div>
              <div className="tech-step-content">
                <strong>Frontend POST</strong> to <code>/api/agent</code> with the question text
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">3</div>
              <div className="tech-step-content">
                <strong>API calls Snowflake Cortex Agent</strong> at <code>HYDRAB_FLEET_AGENT</code>
                <div style={{ marginTop: 8, padding: '12px 16px', background: '#f8f9fa', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}>
                  POST /api/v2/cortex/agent:run<br/>
                  {`{ "agent_name": "HYDRAB_FLEET_AGENT", "messages": [...] }`}
                </div>
              </div>
            </div>
            <div className="tech-step">
              <div className="tech-step-num">4</div>
              <div className="tech-step-content">
                <strong>Cortex Agent processes:</strong>
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
                <strong>Response displayed</strong> in the chat panel
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Pipeline */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Data Pipeline Architecture</div>
        <div style={{ padding: '24px 28px', lineHeight: 1.8, fontSize: 14 }}>
          <div className="tech-diagram">
            <div className="tech-diagram-row">
              <div className="tech-box" style={{ background: '#fef3e8', border: '2px solid #e67e22', color: '#b45309', minWidth: 140 }}>Sources</div>
              <div className="tech-arrow">&rarr;</div>
              <div className="tech-box" style={{ background: '#fff3e0', border: '2px solid #f59e0b', color: '#92400e', minWidth: 140 }}>BRONZE</div>
              <div className="tech-arrow">&rarr;</div>
              <div className="tech-box" style={{ background: '#e8f4fd', border: '2px solid #0077b6', color: '#005a8c', minWidth: 140 }}>SILVER (DT)</div>
              <div className="tech-arrow">&rarr;</div>
              <div className="tech-box tech-box-green" style={{ minWidth: 140 }}>GOLD (DT)</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <table className="tech-table">
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Method</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>BRONZE</strong></td>
                  <td>Inbound share + API ingestion</td>
                  <td>Raw data as-is from source systems</td>
                </tr>
                <tr>
                  <td><strong>SILVER</strong></td>
                  <td>Dynamic Tables (auto-refresh)</td>
                  <td>Cleaned, typed, deduplicated - single source of truth</td>
                </tr>
                <tr>
                  <td><strong>GOLD</strong></td>
                  <td>Dynamic Tables (auto-refresh)</td>
                  <td>Business-ready aggregations for the app and Cortex Agent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deployment */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Deployment (SPCS)</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Container Platform</td><td>Snowpark Container Services (SPCS)</td></tr>
              <tr><td>Compute Pool</td><td><code>HYDRAB_HOL_POOL</code> (CPU_X64_XS, 1-3 nodes, auto-suspend 300s)</td></tr>
              <tr><td>Image Registry</td><td><code>HYDRAB_HOL_SHARED.PUBLIC.IMAGE_REPO</code></td></tr>
              <tr><td>Framework</td><td>Next.js 14 (standalone output) on Node 20 Alpine</td></tr>
              <tr><td>Port</td><td>3000 (HOSTNAME=0.0.0.0 for SPCS ingress)</td></tr>
              <tr><td>Auth</td><td>Snowflake OAuth via SPCS ingress endpoint</td></tr>
              <tr><td>External Access</td><td><code>HYDRAB_EXTERNAL_API</code> (Open-Meteo outbound)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Snowflake Account */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">Snowflake Environment</div>
        <div style={{ padding: '24px 28px' }}>
          <table className="tech-table">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Database</td><td><code>HYDRAB_HOL_&lt;USER&gt;</code> (per-user isolation)</td></tr>
              <tr><td>Warehouse</td><td><code>HYDRAB_HOL_WH</code> (Medium, 1-3 clusters, auto-suspend 60s)</td></tr>
              <tr><td>Schemas</td><td><code>BRONZE</code> &rarr; <code>SILVER</code> &rarr; <code>GOLD</code></td></tr>
              <tr><td>Agent</td><td><code>GOLD.HYDRAB_FLEET_AGENT</code> (Cortex Agent with semantic model)</td></tr>
              <tr><td>Source Share</td><td>Inbound from <code>GXNIMKH.HV05860</code></td></tr>
              <tr><td>Git Integration</td><td><code>HYDRAB_GIT_INTEGRATION</code> (github.com/nele-huvaere/hydrab-hol)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
