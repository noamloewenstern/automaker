/**
 * OpenTelemetry tracing bootstrap for Node.js server.
 *
 * Call initTracing() once at process startup, before any other imports
 * that should be instrumented.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  type SpanProcessor,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import path from 'path';

import { JsonlFileExporter } from './file-exporter.js';
import { HumanReadableFileExporter } from './human-log-exporter.js';

export interface TelemetryOptions {
  /** Directory to write trace files. Defaults to DATA_DIR/traces or ./data/traces */
  tracesDir?: string;
  /** Jaeger OTLP HTTP endpoint. Defaults to http://localhost:4318/v1/traces */
  jaegerEndpoint?: string;
  /** Service version */
  version?: string;
  /** Deployment environment */
  environment?: string;
  /** Sampling rate 0.0-1.0 (default: 1.0 = 100%) */
  samplingRate?: number;
}

let sdk: NodeSDK | null = null;
let initialized = false;

/**
 * Initialize OpenTelemetry tracing.
 *
 * Must be called once at process startup, before other imports where possible.
 * In test environments (NODE_ENV=test), this is a no-op.
 */
export function initTracing(serviceName: string, options: TelemetryOptions = {}): void {
  // No-op in test environment
  if (process.env.NODE_ENV === 'test') return;

  if (initialized) return;
  initialized = true;

  const {
    tracesDir = path.join(process.env.DATA_DIR ?? './data', 'traces'),
    jaegerEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
    version = process.env.npm_package_version ?? '0.0.0',
    environment = process.env.NODE_ENV ?? 'development',
  } = options;

  const isDev = environment === 'development';

  // Enable OTEL internal diagnostics only in debug mode
  if (process.env.OTEL_LOG_LEVEL === 'debug') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: version,
    'deployment.environment': environment,
  });

  // Build span processors
  const processors: SpanProcessor[] = [];

  // Jaeger OTLP/HTTP exporter (if enabled)
  const otelEnabled = process.env.OTEL_ENABLED !== 'false';
  if (otelEnabled) {
    const jaegerExporter = new OTLPTraceExporter({ url: jaegerEndpoint });
    // Always use batch processor for network exporters
    processors.push(new BatchSpanProcessor(jaegerExporter));
  }

  // Local file exporters
  const fileExportersEnabled = process.env.OTEL_FILE_EXPORT !== 'false';
  if (fileExportersEnabled) {
    const jsonlPath = path.join(tracesDir, 'otel-traces.jsonl');
    const logPath = path.join(tracesDir, 'traces.log');

    const jsonlExporter: SpanExporter = new JsonlFileExporter(jsonlPath);
    const humanExporter: SpanExporter = new HumanReadableFileExporter(logPath);

    if (isDev) {
      // Simple processor for low-latency local output in development
      processors.push(new SimpleSpanProcessor(jsonlExporter));
      processors.push(new SimpleSpanProcessor(humanExporter));
    } else {
      processors.push(new BatchSpanProcessor(jsonlExporter));
      processors.push(new BatchSpanProcessor(humanExporter));
    }
  }

  sdk = new NodeSDK({
    resource,
    spanProcessors: processors,
    instrumentations: [
      new HttpInstrumentation({
        // Don't trace health check endpoints to reduce noise
        ignoreIncomingRequestHook: (req) => {
          return req.url === '/api/health';
        },
      }),
      new ExpressInstrumentation(),
    ],
  });

  sdk.start();

  // Graceful shutdown
  process.on('SIGTERM', shutdownTracing);
  process.on('SIGINT', shutdownTracing);
}

/**
 * Flush and shut down the OTEL SDK gracefully.
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
    } catch {
      // Ignore shutdown errors
    }
    sdk = null;
  }
}
