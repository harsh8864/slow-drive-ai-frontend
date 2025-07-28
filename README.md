# Therapist AI - Priya

A compassionate AI therapist application designed to provide emotional support and guidance. Features speech recognition, text-to-speech, emotion detection, and a calming interface.

## Features

- 🤖 **AI Therapy Sessions** - Powered by Google Gemini AI
- 🎤 **Voice Recognition** - Speak to interact with the AI
- 🔊 **Text-to-Speech** - AI responses are spoken aloud
- 😊 **Emotion Detection** - Real-time mood analysis
- 🌙 **Dark/Light Mode** - Comfortable viewing in any lighting
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔄 **Real-time Status** - Connection status indicators

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with microphone support

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd therapist-ai-priya
   npm install
   cd backend
   npm install
   cd ..
   ```

2. **Set up the backend:**
   ```bash
   cd backend
   # Create a .env file with your Gemini API key
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   npm start
   ```

3. **Start the frontend (in a new terminal):**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Configuration

### Backend Setup

1. **Get a Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Create environment file:**
   ```bash
   cd backend
   # Create .env file
   echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```

### Frontend Setup

The frontend will automatically connect to the backend. If the backend is not running, the app will show a "Backend Offline" status and use demo responses.

## Usage

1. **Start a conversation:** Type or speak your message
2. **Voice input:** Click the microphone button to speak
3. **Listen to responses:** AI responses are automatically spoken
4. **Toggle theme:** Click the sun/moon icon for dark/light mode
5. **Check status:** Look at the status indicator in the top-left

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 5000 is available
- Ensure all dependencies are installed: `npm install`
- Verify your `.env` file exists and has the correct API key

**Speech recognition not working:**
- Ensure you're using HTTPS or localhost
- Check browser permissions for microphone access
- Try refreshing the page

**TensorFlow errors:**
- These are non-critical and won't affect basic functionality
- The app will work without emotion detection

**API key issues:**
- Verify your Gemini API key is correct
- Check your Google AI Studio account for quota limits
- The app will work in demo mode without an API key

### Browser Compatibility

- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Limited speech recognition support
- **Mobile browsers:** May have limited speech recognition

## Development

### Project Structure

```
therapist-ai-priya/
├── src/                    # Frontend React code
│   ├── App.js             # Main application component
│   ├── App.css            # Styles
│   └── tfjs-init.js       # TensorFlow initialization
├── backend/               # Express.js backend
│   ├── index.mjs          # Server code
│   └── package.json       # Backend dependencies
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

### Available Scripts

**Frontend:**
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

**Backend:**
- `npm start` - Start backend server

### Environment Variables

**Backend (.env):**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

- `POST /message` - Send a message to the AI
- `GET /health` - Check server status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Look at the browser console for error messages
3. Ensure both frontend and backend are running
4. Verify your API key is correct

## Demo Mode

The application works without an API key in demo mode, providing pre-written therapeutic responses. This is useful for testing and development.
