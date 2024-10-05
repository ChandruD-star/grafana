import http from 'k6/http';
import { sleep } from 'k6';

// Set the OpenTelemetry Collector HTTP endpoint
const OTEL_COLLECTOR_ENDPOINT = 'http://localhost:4318/v1/logs';

export const options = {
    vus: 5,      // Number of virtual users
    duration: '1m',  // Test duration
};

export default function () {
    // Create a sample log entry in JSON format
    const logEntry = JSON.stringify({
        resourceLogs: [{
            resource: {
                attributes: [
                    { key: 'service.name', value: { stringValue: 'k6-test-service' } },
                    { key: 'service.instance.id', value: { stringValue: 'instance-1' } },
                ],
            },
            scopeLogs: [{
                scope: {
                    name: 'k6-log',
                    version: '1.0.0',
                },
                logRecords: [{
                    timeUnixNano: Date.now() * 1e6,
                    severityText: 'INFO',
                    body: { stringValue: 'Sample log message from K6' },
                    attributes: [
                        { key: 'http.method', value: { stringValue: 'GET' } },
                        { key: 'http.status_code', value: { intValue: 200 } },
                    ],
                }],
            }],
        }],
    });

    // Send log to the OpenTelemetry Collector
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(OTEL_COLLECTOR_ENDPOINT, logEntry, params);

    // Check response status
    if (res.status === 200) {
        console.log('Log successfully sent');
    } else {
        console.error(`Failed to send log. Status: ${res.status}`);
    }

    sleep(1);
}
