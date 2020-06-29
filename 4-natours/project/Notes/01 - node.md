# NATours notes

- `.json` to parse and send json data. No need for send.
- Status `200` is default if not specified

## APIs

- Application programming Interface
- Allows apps to talk to each other
- Allows you to be multi-platform
- Flexible product
- Representative State Transfer

## REST
- Structured, resource-based urls
- Logical resources
- 'Stateless'

## Structure / Resource
- An object of something, eg. users, reviews, tours
- Endpoints should **only contain resources**, not the action name
- eg /tours not /getTours. Only use the resource in the endpoint
- Use plurals
- Verb is kept in the method/implementation itself

## JSON
- Different to JS object
- Keys to be strings
- *JSend* format is a JSON **response standard**
  - Includes a "status" and "data"
  - Request contains **all information necessary**
- Stateless: ie handled on client. Server doesn't need to know current 'state' eg page number

## Learning approach
- Build API first
- Mongoose, Express, MongoDB

## Routes can be refactored

- Using chaining
- `app.route('./api/v1/<resource>').post(methodName).get(methodName2)`
- Instead of `app.post('./api/v1/route', methodName())`

# Request / Response cycle

- Middleware manipulates the request
- Executed between receiving request and sending response
- Middleware stack
- Order is important - executed in order
- Req and Res go through each middleware in the *pipeline*
- Ends with `res.send`

# Creating middleware

