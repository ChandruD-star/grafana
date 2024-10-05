#Step 1 - Using official GOLANG image with alpine variant
FROM golang:1.23.1-alpine3.20

# *****************************************
# INFORMATION FROM BASE IMAGE
# ---------------------------
# WORKDIR = /go 
# GOLANG_VERSION=1.23.1
# *****************************************

#Step 2 - Installing XK6 followed by xk6 extensions to create custom k6 binary
RUN go install go.k6.io/xk6/cmd/xk6@latest
RUN xk6 build latest --with github.com/grafana/xk6-sql --with github.com/thmshmm/xk6-opentelemetry

#Step 3 - Copying the K6 test scripts to "./scripts" folder
COPY ./k6 ./scripts

#Step 4 - Setting the Environment variables
ENV API_ENDPOINT=https://dummy-test.io/api
ENV TEST_SCOPE=default
ENV SCRIPT_NAME=dummy-test.js

#Step 5 - Command to execute in the container
CMD ["/bin/sh", "-c", "./k6 run ./scripts/$TEST_SCOPE/$SCRIPT_NAME"]