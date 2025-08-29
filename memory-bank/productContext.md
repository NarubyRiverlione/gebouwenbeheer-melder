# Product Context

This issue reporting and clustering system addresses the challenge of managing large volumes of maintenance and operational reports for building managers and facility teams. Without a standardized workflow, incoming reports can be inconsistent, difficult to track, and labor-intensive to triage.

Key benefits:
- Ensures every reported issue is captured in a uniform, structured format.
- Offers quick visibility into unprocessed and unresolved reports via simple REST APIs.
- Automates grouping of related reports into issue clusters, reducing manual overhead and highlighting systemic problems.
- Provides filtering and time-based queries so stakeholders can monitor trends and prioritize interventions.
- Enables bulk resolution by marking clusters resolved, which cascades to associated reports.
- Provides an API to ingest email content and extract structured report data, returning validation errors for missing mandatory fields.
- All documentation, variable names, and comments must be in English; reported issue content will be in Dutch to support later analysis.

End users (maintenance staff, property managers) interact via HTTP endpoints, integrating easily into dashboards or notification pipelines.
