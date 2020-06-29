# Node and Streams

- Single-threaded
- Event-driven
- Uses V8 and Libuv
- Libuv hosts event loop
- Thread pool
- Libuv is in C++

## Thread pool

Node JS process is an instance of a C++ program.
Single threaded, so must avoid blocking it.

## Node program order on running

- Initialise program
- Top-level code executed (not callbacks)
- Modules required
- Register callbacs
- _Then_ Event Loop starts

Event loop offloads to the thread pool to avoid blocking main thread  
eg:

- File system operations
- Cryptography
- Compression
- DNS lookups

## Event Loop

Event loop orchestrates. Receives events, calls the callbacks, and offloads tasks to the **Event Pool**

### Phases of Event Loop

Event loop received events.
Each phase has its own callback queue.

- Expired timer callbacks
- I/O polling/file access and callbacks - **most of code executed here**
- setImmediate callbacks
- Closes callbacks

**Additionally**

- Process.NextTick() queue
- MicroTasks Queue (resolved promises)

**Microtask Queue will run immediately whatever the phase**
Eg. Promise resolves with returned data _while_ the callback from a timer is running.
Promise callback will be run the very next one to run.

Node will not exit while I/O is still running.

**Summary**

- Event Loop is what makes Async coding possible - Important design feature of Node
- Allows many users to access one thread
- Event loop offloads tasks to Thread Pool
- Other languages use multiple threads

## Not blocking Event Loop

- Use `sync` versions of functions in `crypto, fs, zlib` modules
- Don't use complex calcs
- Beware of large JSON
- No complex regex

## Event-driven architecture

- Event emitters and listeners
- Calling callback functions
- Observer pattern is listening for 'events'
- De-coupled
- Many listeners possible per event

# Streams

- We read or write part of the data, piece by piece
- More efficient than waiting for whole block of data

### Types of streams

- **Readable**
  - Read/consumable
  - eg. http requests, `fs` read streams
  - Events: `data` and `end`
  - Functions: `pipe()`, `read()`
- **Writable**
  - Ones we can write to
  - Eg. `http` `response`, `fs` writable streams
  - Events: `drain`, `finish`
  - Functions: `write()`, `end()`
- **Duplex**
  - Both read and write
  - `net` module. Socket that stays open
  - Less common
- **Transform**
  - Duplex that also transform streams
  - Less common

These Events and functions made available are for *consuming* each type of stream.

Streams allow reading of data and sending to client bit by bit to avoid delay.

'Back-pressure' is when the source is feeding data faster than we can process and send to the client.

