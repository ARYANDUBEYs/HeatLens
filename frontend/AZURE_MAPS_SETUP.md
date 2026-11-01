# HeatLens × Microsoft Imagine Cup 2026
# FRONTEND — AZURE MAPS INTEGRATION GUIDE
# File: frontend/AZURE_MAPS_SETUP.md
=============================================================

## STEP 1: INSTALL AZURE MAPS

npm install azure-maps-control azure-maps-drawing-tools
npm install @azure/msal-browser  # for Azure AD auth (optional)


## STEP 2: ADD CSS TO index.html

<link rel="stylesheet" href="https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css" />


## STEP 3: REPLACE LEAFLET WITH AZURE MAPS

```javascript
// OLD: Leaflet initialization
// const map = L.map('map').setView([28.6139, 77.2090], 11);

// NEW: Azure Maps initialization
import * as atlas from 'azure-maps-control';

const map = new atlas.Map('map', {
    center: [77.2090, 28.6139],  // Note: Azure Maps uses [lng, lat] order
    zoom: 11,
    language: 'en-US',
    authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: process.env.REACT_APP_AZURE_MAPS_KEY
    }
});

map.events.add('ready', () => {
    console.log('Azure Maps ready!');
    loadWardBoundaries();
    loadHeatVulnerabilityLayer();
});
```


## STEP 4: LOAD WARD BOUNDARIES (GeoJSON Choropleth)

```javascript
async function loadHeatVulnerabilityLayer() {
    // Fetch ward scores from backend
    const response = await fetch('/api/ward-scores?city=delhi&date=2025-07');
    const wardScores = await response.json();

    // Create data source
    const dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);

    // Load ward GeoJSON boundaries
    const wardGeoJSON = await fetch('/data/delhi_ward_boundaries.geojson').then(r => r.json());

    // Merge vulnerability scores into GeoJSON properties
    wardGeoJSON.features.forEach(feature => {
        const wardScore = wardScores.find(w => w.ward_id === feature.properties.ward_id);
        if (wardScore) {
            feature.properties.vulnerability_score = wardScore.vulnerability_score;
            feature.properties.lst_celsius = wardScore.lst_celsius;
            feature.properties.risk_tier = wardScore.risk_tier;
        }
    });

    dataSource.add(wardGeoJSON);

    // Create choropleth layer (green → yellow → red)
    const polygonLayer = new atlas.layer.PolygonLayer(dataSource, 'ward-heat-layer', {
        fillColor: [
            'interpolate',
            ['linear'],
            ['get', 'vulnerability_score'],
            0.0, '#00CC44',   // LOW: green
            0.4, '#FFCC00',   // MEDIUM: yellow
            0.7, '#FF4400',   // HIGH: orange-red
            1.0, '#CC0000'    // EXTREME: dark red
        ],
        fillOpacity: 0.7
    });

    map.layers.add(polygonLayer);

    // Add tooltip on hover
    map.events.add('mousemove', polygonLayer, (e) => {
        if (e.shapes && e.shapes.length > 0) {
            const props = e.shapes[0].getProperties();
            showTooltip(`
                <b>${props.ward_name}</b><br/>
                🌡️ LST: ${props.lst_celsius}°C<br/>
                ⚠️ Risk: ${props.risk_tier}<br/>
                Score: ${(props.vulnerability_score * 100).toFixed(1)}%
            `, e.position);
        }
    });
}
```


## STEP 5: CONNECT CHAT TO MAP (Azure OpenAI → Azure Maps)

```javascript
async function sendChatMessage(userMessage) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();

    // Display AI response in chat UI
    appendChatMessage('assistant', data.answer);

    // Update map based on returned ward data
    if (data.map_data && data.map_data.length > 0) {
        highlightWardsOnMap(data.map_data);
    }
}

function highlightWardsOnMap(wardData) {
    // Zoom to relevant wards and add highlight pins
    wardData.forEach(item => {
        if (item.top_wards) {
            item.top_wards.forEach(ward => {
                // Add red marker for each high-risk ward
                const marker = new atlas.HtmlMarker({
                    position: [ward.lng, ward.lat],
                    color: ward.risk_tier === 'HIGH' ? 'red' : 'orange',
                    text: ward.ward,
                    popup: new atlas.Popup({
                        content: `<div style="padding:8px">
                            <b>${ward.ward}</b><br/>
                            🌡️ ${ward.lst_celsius}°C<br/>
                            Score: ${(ward.score * 100).toFixed(0)}%
                        </div>`
                    })
                });
                map.markers.add(marker);
            });
        }
    });
}
```


## STEP 6: ENVIRONMENT VARIABLES (.env.local)

REACT_APP_AZURE_MAPS_KEY=your_azure_maps_subscription_key
REACT_APP_BACKEND_URL=http://localhost:8000


## STEP 7: GET AZURE MAPS KEY

1. Go to Azure Portal: portal.azure.com
2. Create resource → search "Azure Maps"
3. Create account: heatlens-maps, region: Central India
4. Go to resource → Authentication → copy Primary Key
5. Paste in .env.local


## DEMO QUERY TO TEST (paste in chat box)

"Which 5 wards in Delhi are most vulnerable to heat and 
need emergency cooling centers this summer?"

Expected behavior:
- Azure OpenAI calls get_top_hottest_wards(city="Delhi", k=5)
- Backend returns top 5 ward scores
- Azure Maps highlights those 5 wards with red markers
- Chat shows: "The 5 most heat-vulnerable wards are: Ward_1 (47°C, HIGH risk)..."
