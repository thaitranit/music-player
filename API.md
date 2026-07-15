# D4T MP3 API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
Some endpoints require a valid JWT token. Include it in the headers:
```
Authorization: Bearer <your-token>
```

---

## Endpoints

### Health Check
- **GET** `/health` - Check API and MongoDB status

### Authentication
- **POST** `/auth/register` - Register a new user
  - Body: `{ username, password }`
- **POST** `/auth/login` - Login user
  - Body: `{ username, password }`
- **GET** `/auth/me` - Get current user info (requires auth)

### Songs
- **GET** `/songs` - Get all active songs
- **GET** `/songs/popular` - Get top 10 most played songs
- **GET** `/songs/search?q=keyword` - Search songs by name, singer, or album
- **GET** `/songs/:id` - Get song by ID
- **POST** `/songs` - Create new song (requires auth)
  - Body: `{ id, name, singer, album?, genre?, duration?, path, image? }`
- **PUT** `/songs/:id` - Update song (requires auth)
- **DELETE** `/songs/:id` - Soft delete song (requires auth)
- **POST** `/songs/:id/play` - Increment play count

---

## Song Model
```javascript
{
  id: String,           // Unique identifier
  name: String,         // Song name (required)
  singer: String,       // Singer name (required)
  album: String,        // Album name (default: 'Single')
  genre: String,        // Genre (default: 'Pop')
  duration: Number,     // Duration in seconds (default: 0)
  releaseDate: Date,    // Release date
  path: String,         // File path to audio (required)
  image: String,        // Cover image URL
  plays: Number,        // Play count (default: 0)
  isActive: Boolean,    // Active status (default: true)
  createdAt: Date,
  updatedAt: Date
}
```
