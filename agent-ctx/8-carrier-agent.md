---
Task ID: 8
Agent: carrier-agent
Task: Order tracking with TCS/Leopards carrier integration

Work Log:
- Read worklog.md, Prisma schema, existing shipping API routes, order tracking page, shipment tracker component, types
- Verified Prisma Shipment model already has carrier, trackingNumber, trackingUrl, estimatedDelivery fields — no schema changes needed
- Created src/lib/pakistan-cities.ts — 60+ Pakistani cities with TCS and Leopards city codes, province info, helper functions
- Created src/lib/carriers/types.ts — CarrierProvider interface, ShipmentRequest, ShipmentResponse, TrackingResponse, CancelResponse, TrackingEvent types
- Created src/lib/carriers/tcs.ts — Full TCS carrier integration with sandbox/mock mode, live API integration with retry logic
- Created src/lib/carriers/leopards.ts — Full Leopards Courier integration with sandbox/mock mode, live API integration with retry logic
- Created src/lib/carriers/index.ts — Carrier abstraction layer with getCarrier(), getAvailableCarriers(), getCarrierProviders(), getDefaultCarrier(), plus Self-Delivery provider
- Created src/app/api/shipping/carriers/route.ts — GET endpoint to list available carriers
- Created src/app/api/shipping/book/route.ts — POST endpoint to book a shipment with a carrier (calls carrier API, creates Shipment record, updates Order)
- Created src/app/api/shipping/track/[trackingNumber]/route.ts — GET endpoint for live tracking with 5-minute cache, auto-syncs carrier status to DB
- Created src/app/api/shipping/cancel-shipment/route.ts — POST endpoint to cancel a shipment (calls carrier API + updates DB)
- Created src/components/marketplace/shipping/book-shipment-dialog.tsx — Carrier selection dialog with TCS/Leopards/Self-delivery options
- Created src/components/marketplace/shipping/live-tracking-section.tsx — Live tracking timeline with carrier data, history, cancel button
- Enhanced order-tracking-page.tsx with Book Shipment button, LiveTrackingSection integration, Track Package button for buyers

Stage Summary:
- Full TCS and Leopards Courier carrier integration with sandbox/mock mode for development
- Carrier abstraction layer with 3 providers: TCS, Leopards, Self-Delivery
- 4 new API routes: /shipping/carriers, /shipping/book, /shipping/track/[trackingNumber], /shipping/cancel-shipment
- 2 new UI components: BookShipmentDialog, LiveTrackingSection
- Enhanced order tracking page with carrier booking and live tracking features
- Pakistan cities database with 60+ cities and carrier-specific city codes
- Lint passes with 0 errors (3 pre-existing warnings unrelated to this task)
- Dev server running successfully on port 3000
