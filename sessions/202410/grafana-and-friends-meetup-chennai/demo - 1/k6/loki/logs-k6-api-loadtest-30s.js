import http from 'k6/http';
import { check, fail, sleep } from 'k6';

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

// Retrieve environment variables
const API_ENDPOINT = __ENV.API_ENDPOINT || fail("provide -e API_ENDPOINT when starting k6");

export default function () {
    let url = `${API_ENDPOINT}`;

    let payload = JSON.stringify({
        resourceLogs: [
            {
                resource: {
                    attributes: [
                        {
                            key: 'service.name',
                            value: { stringValue: 'k6-loki-test' }
                        }
                    ]
                },
                scopeLogs: [
                    {
                        scope: {
                            name: 'example-scope',
                            version: '1.0.0'
                        },
                        logRecords: [
                            {
                                timeUnixNano: Date.now() * 1e6,
                                severityText: 'INFO',
                                body: { stringValue: 'This is an example log message' },
                                attributes: [
                                    {
                                        key: 'example.attribute',
                                        value: { stringValue: 'example_value' }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });

    let params = {
        headers: {
            'User-Agent': 'k6-loki-load-test',
            'Content-Type': 'application/json'
        },
    };

    let res = http.post(url, payload, params);

    check(res, {
        'status was 200': (r) => r.status === 200,
    });
}
