FROM golang

# Copy local storage
ADD . /go/src/axionbuster/go-wkt

# Build inside
WORKDIR /go/src/axionbuster/go-wkt
RUN go install .

# Run the output
ENV GIN_MODE=release
ENTRYPOINT [ "/go/bin/go-wkt" ]

# Document port
EXPOSE 8080
