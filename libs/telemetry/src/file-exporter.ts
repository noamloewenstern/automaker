/**
 * Custom JSONL file exporter for OpenTelemetry spans.
 *
 * Writes completed spans as newline-delimited JSON to a file.
 * Rotates the file at 50 MB keeping up to 3 backups.
 */

import fs from 'fs';
import path from 'path';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-node';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { hrTimeToMilliseconds } from '@opentelemetry/core';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_BACKUPS = 3;

/**
 * Rotate log files if the current file exceeds the size limit.
 * Follows pattern: .3 deleted, .2 -> .3, .1 -> .2, current -> .1
 */
function rotateLogs(filePath: string): void {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_FILE_SIZE_BYTES) return;
  } catch {
    return; // File doesn't exist or can't be stat'd — no rotation needed
  }

  // Rotate existing backups
  for (let i = MAX_BACKUPS; i >= 1; i--) {
    const backup = `${filePath}.${i}`;
    const nextBackup = `${filePath}.${i + 1}`;
    try {
      if (i === MAX_BACKUPS) {
        fs.unlinkSync(backup);
      } else {
        fs.renameSync(backup, nextBackup);
      }
    } catch {
      // Ignore — backup may not exist
    }
  }

  try {
    fs.renameSync(filePath, `${filePath}.1`);
  } catch {
    // Ignore
  }
}

/**
 * Convert a ReadableSpan to an OTLP-compatible JSON object.
 */
function spanToOtlpJson(span: ReadableSpan): Record<string, unknown> {
  const ctx = span.spanContext();
  return {
    traceId: ctx.traceId,
    spanId: ctx.spanId,
    parentSpanId: span.parentSpanId,
    name: span.name,
    kind: span.kind,
    startTimeUnixNano: span.startTime[0] * 1e9 + span.startTime[1],
    endTimeUnixNano: span.endTime[0] * 1e9 + span.endTime[1],
    durationMs: hrTimeToMilliseconds(span.duration),
    status: span.status,
    attributes: span.attributes,
    resource: span.resource.attributes,
    events: span.events.map((e) => ({
      name: e.name,
      timeUnixNano: e.time[0] * 1e9 + e.time[1],
      attributes: e.attributes,
    })),
    links: span.links.map((l) => ({
      traceId: l.context.traceId,
      spanId: l.context.spanId,
      attributes: l.attributes,
    })),
  };
}

/**
 * SpanExporter that writes spans as newline-delimited JSON to a file.
 */
export class JsonlFileExporter implements SpanExporter {
  private readonly filePath: string;
  private closed = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    } catch {
      // Ignore
    }
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    if (this.closed) {
      resultCallback({ code: ExportResultCode.FAILED, error: new Error('Exporter is shut down') });
      return;
    }

    try {
      rotateLogs(this.filePath);
      const lines = spans.map((span) => JSON.stringify(spanToOtlpJson(span))).join('\n');
      if (lines) {
        fs.appendFileSync(this.filePath, lines + '\n', 'utf-8');
      }
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      resultCallback({ code: ExportResultCode.FAILED, error: error as Error });
    }
  }

  shutdown(): Promise<void> {
    this.closed = true;
    return Promise.resolve();
  }
}
