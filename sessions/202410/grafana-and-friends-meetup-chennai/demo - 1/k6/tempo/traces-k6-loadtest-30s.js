import http from 'k6/http';
import { check, fail } from 'k6';
import generator from 'k6/x/opentelemetry';

export const options = {
    scenarios: {
        my_scenario1: {
            executor: 'constant-arrival-rate',
            duration: '30s',         
            preAllocatedVUs: 100,    
            maxVUs: 5000,            
            gracefulStop: '0s',      
            rate: 100,               
            timeUnit: '1s',
        },
    },
};

// Retrieve mandatory environment variables
const API_ENDPOINT = __ENV.API_ENDPOINT || fail("provide -e API_ENDPOINT when starting k6");

export default function () {
    const url = `${API_ENDPOINT}/v1/traces`;

    const params = {
        headers: {
            'User-Agent': 'k6-tempo-load-test',
            'Content-Type': 'application/json'
        },
    };

    let payload = JSON.stringify({
        resourceSpans: [
            {
                resource: {
                    attributes: [
                        {
                            key: 'service.name',
                            value: { stringValue: 'tempo-test' }
                        }
                    ]
                },
                scopeSpans: [
                    {
                        scope: {
                            name: 'example-scope',
                            version: '1.0.0'
                        },
                        spans: [
                            {
                                traceId: generator.newTraceID(), // Use the generated traceId
                                spanId: generator.newSpanID(),   // Use the generated spanId
                                name: 'operationA',
                                startTimeUnixNano: Date.now() * 1e6,
                                endTimeUnixNano: (Date.now() + 1000) * 1e6,
                                events: [
                                    {
                                        timeUnixNano: Date.now() * 1e6,
                                        name: 'event-with-attr',
                                        attributes: [
                                            {
                                                key: 'span-event-attr',
                                                value: { stringValue: 'span-event-attr-val' }
                                            }
                                        ],
                                    },
                                    {
                                        timeUnixNano: Date.now() * 1e6,
                                        name: 'event',
                                    }
                                ],
                                status: {
                                    message: 'status-cancelled',
                                    code: 2,
                                },
                            }
                        ]
                    }
                ]
            }
        ]
    });

    let res = http.post(url, payload, params);

    check(res, {
        'status was 200': (r) => r.status === 200,
    });

    if (res.status === 400) {
        console.log(`Request URL: ${url}`);
        console.log(`Request Payload: ${payload}`);
        console.log(`Request Headers: ${JSON.stringify(params.headers)}`);
        console.log(`Response Body: ${res.body}`);
    }
}
