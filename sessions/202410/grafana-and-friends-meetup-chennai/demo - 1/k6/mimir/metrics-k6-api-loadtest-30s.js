import {check, fail, sleep} from 'k6';
import http from 'k6/http';

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

const API_ENDPOINT = __ENV.API_ENDPOINT || fail("provide -e API_ENDPOINT when starting k6");

export default function () {
    const url = `${API_ENDPOINT}/v1/metrics`;
    const params = {
        headers: {
            'User-Agent': 'k6-load-test',
            'Content-Type': 'application/json'
        },
    };

    const payload = JSON.stringify({
        resourceMetrics: [
            {
                resource: {
                    attributes: [
                        {
                            key: 'service.name',
                            value: { stringValue: 'mimir-test' }
                        }
                    ]
                },
                scopeMetrics: [
                    {
                        scope: {
                            name: 'example-scope',
                            version: '1.0.0'
                        },
                        metrics: [
                            {
                                name: `example_metric_${__VU}`,
                                description: 'An example metric',
                                unit: '1',
                                sum: {
                                    dataPoints: [
                                        {
                                            attributes: [],
                                            startTimeUnixNano: Date.now() * 1e6,
                                            timeUnixNano: Date.now() * 1e6,
                                            asDouble: Math.random() * 100
                                        }
                                    ],
                                    aggregationTemporality: 2, // Cumulative
                                    isMonotonic: false
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    });

    const res = http.post(url, payload, params);

    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
