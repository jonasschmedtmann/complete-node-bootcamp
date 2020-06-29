# Web fundamentals

## Request / Response model

- Browser requests to DNS.
- Matches the Domain name to an IP and responds to browser request
- Browser opens a TCP/IP Connection to that server
- Client makes HTTP request
  - Includes a specific HTTP format:
  - Verbs on the HTTP 'Start-line'
  - Request headers
- Server responds with HTTP Response
  - Specific HTTP format
  - Start-line - Status, http version
  - Response headers
  - Response body - defined by developer
- TCP breaks data into chunks for IP to transfer
- IP Routes each packet to its destination

## Server

- Server runs a HTTP server
- Dynamic server might also run an app
- Accesses Database
- Stores files
- Backend stack: Node and MongoDB (most popular for Node)

## APIs

Static and dynamic site

**Static**

- Upload flat HTML files.
- Server delivers static files

**Dynamic**

- Server-rendered
- Built on the server on each request
  - Server builds HTML and sends back
  - 'Server-side' rendering
  - Gets data from database
