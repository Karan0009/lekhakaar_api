// Leaky bucket parameters
const maxCapacity = 10; // Max requests the bucket can hold
const leakRate = 2; // Requests that "leak" from the bucket per second (allowable request rate)

// Store user buckets (in-memory)
const buckets = {};

// Middleware to implement leaky bucket
function leakyBucketMiddleware(req, res, next) {
  const userIP = req.ip;

  if (!buckets[userIP]) {
    // If no bucket for this IP, create one
    buckets[userIP] = {
      capacity: maxCapacity,
      lastLeakTime: Date.now(),
    };
  }

  const bucket = buckets[userIP];

  // Calculate how much time has passed since the last request
  const now = Date.now();
  const elapsedTime = (now - bucket.lastLeakTime) / 1000; // Convert to seconds

  // Calculate how much the bucket has leaked
  const leakedRequests = Math.floor(elapsedTime * leakRate);

  // Update the bucket's capacity, ensuring it doesn't exceed the max capacity
  bucket.capacity = Math.min(bucket.capacity + leakedRequests, maxCapacity);

  // Update the last leak time to now
  bucket.lastLeakTime = now;

  // If the bucket has capacity, allow the request
  if (bucket.capacity > 0) {
    bucket.capacity--; // Consume one slot in the bucket
    next(); // Continue to the next middleware or route handler
  } else {
    // If no capacity, reject the request
    res.status(429).send('Too many requests. Slow down!');
  }
}

export default leakyBucketMiddleware;

// // Use the leaky bucket middleware
// app.use(leakyBucketMiddleware);

// // Simple route to test the rate limiter
// app.get('/', (req, res) => {
//     res.send('You passed the leaky bucket!');
// });

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });
