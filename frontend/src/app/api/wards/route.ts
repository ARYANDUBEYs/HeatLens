import { NextRequest, NextResponse } from "next/server";
import { mockWards } from "@/data/mockWards";
import { delhiWardFeatureCollection } from "@/data/delhiGeoJson";
import { WardMetrics } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");
    const minPriority = searchParams.get("minPriority");
    const format = searchParams.get("format");

    let wards: WardMetrics[] = [...mockWards];

    // Optional Azure Cosmos DB live query if connection string is configured
    const cosmosConnStr = process.env.AZURE_COSMOS_CONNECTION_STRING;
    if (cosmosConnStr && !cosmosConnStr.startsWith("your_")) {
      try {
        // Cosmos DB client query would execute here in production
      } catch (err) {
        console.warn("[Cosmos DB Query Fallback] Falling back to baseline telemetry:", err);
      }
    }

    // Apply zone filter
    if (zone && zone !== "All Delhi NCR") {
      wards = wards.filter((w) => w.zone.toLowerCase() === zone.toLowerCase());
    }

    // Apply minimum priority score filter
    if (minPriority) {
      const minVal = parseFloat(minPriority);
      if (!isNaN(minVal)) {
        wards = wards.filter((w) => w.priorityScore >= minVal);
      }
    }

    // Return GeoJSON format if requested
    if (format === "geojson") {
      const filteredFeatures = delhiWardFeatureCollection.features.filter((f) =>
        wards.some((w) => w.id === f.properties.id)
      );

      return NextResponse.json({
        type: "FeatureCollection",
        metadata: {
          ...delhiWardFeatureCollection.metadata,
          totalWards: filteredFeatures.length,
          filteredBy: { zone, minPriority },
        },
        features: filteredFeatures,
      });
    }

    // Default JSON response
    return NextResponse.json({
      city: "Delhi NCR",
      totalWards: wards.length,
      wards,
    });
  } catch (error) {
    console.error("[API /api/wards error]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching ward metrics." },
      { status: 500 }
    );
  }
}
