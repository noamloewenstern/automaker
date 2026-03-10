/**
 * @automaker/telemetry
 *
 * OpenTelemetry instrumentation bootstrap for the Automaker monorepo.
 *
 * Usage:
 *   import { initTracing } from '@automaker/telemetry';
 *   initTracing('my-service');  // Call once at process startup
 *
 *   import { getTracer, withSpan } from '@automaker/telemetry';
 *   const tracer = getTracer('my-module');
 *   await withSpan(tracer, 'my.operation', async (span) => { ... });
 */

export { initTracing, shutdownTracing, type TelemetryOptions } from './init-tracing.js';
export {
  getTracer,
  getActiveSpan,
  addSpanEvent,
  withSpan,
  getCurrentTraceContext,
} from './tracer.js';
export { JsonlFileExporter } from './file-exporter.js';
export { HumanReadableFileExporter } from './human-log-exporter.js';
