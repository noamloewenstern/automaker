/**
 * OpenTelemetry instrumentation bootstrap.
 *
 * This file must be imported at the very top of the server entry point,
 * before any other imports, to ensure auto-instrumentation patches are
 * applied before instrumented modules are loaded.
 */

import { initTracing } from '@automaker/telemetry';

// Initialize tracing immediately on import.
// In test environments (NODE_ENV=test), this is a no-op.
initTracing('automaker-server');
