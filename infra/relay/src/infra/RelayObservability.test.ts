import { describe, expect, it } from "vitest";

import {
  RELAY_AXIOM_TRACE_DATASET,
  relayAxiomIngestDatasetCapabilities,
  relayAxiomQueryDatasetCapabilities,
  relayRecentSpansQuery,
  relayTraceQuery,
} from "./RelayObservability.ts";

describe("RelayObservability", () => {
  it("scopes the ingest token only to HTTP span ingestion", () => {
    expect(relayAxiomIngestDatasetCapabilities()).toEqual({
      [RELAY_AXIOM_TRACE_DATASET]: { ingest: ["create"] },
    });
  });

  it("scopes the diagnostics query token only to HTTP spans", () => {
    expect(relayAxiomQueryDatasetCapabilities()).toEqual({
      [RELAY_AXIOM_TRACE_DATASET]: { query: ["read"] },
    });
  });

  it("builds APL queries for the trace dataset", () => {
    expect(relayTraceQuery("| where name == 'GET /health'", "relay-traces-test")).toBe(
      "['relay-traces-test']\n| where name == 'GET /health'",
    );
  });

  it("projects Effect HTTP span attributes through their OTLP field names", () => {
    const query = relayRecentSpansQuery("relay-traces-test");

    expect(query).toContain("['relay-traces-test']");
    expect(query).toContain("attributes.http.request.method");
    expect(query).toContain("attributes.http.response.status_code");
    expect(query).toContain("attributes.url.path");
    expect(query).toContain("attributes.relay.endpoint");
    expect(query).not.toContain("['http.request.method']");
  });
});
