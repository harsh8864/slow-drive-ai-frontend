import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi there! I'm Numa, your AI therapist. I'm here to provide a safe space where your feelings are valid and you don't have to be perfect. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [serverStatus, setServerStatus] = useState('checking');
  const [currentMood, setCurrentMood] = useState('neutral');
  const [moodHistory, setMoodHistory] = useState([]);
  const [lastReminder, setLastReminder] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTraumaSupport, setShowTraumaSupport] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'You',
    issues: [],
    preferences: {},
    lastSession: null,
    traumaAware: true
  });
  const [journal, setJournal] = useState([]);
  const [showJournal, setShowJournal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState('');
  const [showGratitude, setShowGratitude] = useState(false);
  const [gratitudeList, setGratitudeList] = useState(['', '', '']);
  const [showCrisis, setShowCrisis] = useState(false);
  const [crisisInfo, setCrisisInfo] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [voiceMemories, setVoiceMemories] = useState([]);
  const [showVoiceMemories, setShowVoiceMemories] = useState(false);
  const [recordConsent, setRecordConsent] = useState(false);
  const audioRef = useRef(null);
  const [showMoodCalendar, setShowMoodCalendar] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // API base URL configuration
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || 'https://therapist-ai-priya-backend.onrender.com'
    : 'http://localhost:5000';

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        setServerStatus(response.data.apiKeyConfigured ? 'connected' : 'demo');
      } catch (error) {
        setServerStatus('disconnected');
        console.warn('Backend server not running. Please start the backend server.');
      }
    };
    
    checkServerStatus();
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    const savedMoodHistory = localStorage.getItem('moodHistory');
    const savedUserProfile = localStorage.getItem('userProfile');
    const savedLastReminder = localStorage.getItem('lastReminder');

    if (savedMoodHistory) {
      setMoodHistory(JSON.parse(savedMoodHistory));
    }
    if (savedUserProfile) {
      setUserProfile(JSON.parse(savedUserProfile));
    }
    if (savedLastReminder) {
      setLastReminder(new Date(savedLastReminder));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    if (lastReminder) {
      localStorage.setItem('lastReminder', lastReminder.toISOString());
    }
  }, [moodHistory, userProfile, lastReminder]);

  // Daily reminder system with trauma awareness
  useEffect(() => {
    const checkDailyReminder = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (!lastReminder || new Date(lastReminder).getTime() < today.getTime()) {
        // Send trauma-aware daily reflection reminder
        const reminderMessages = [
          "Good morning Slow Drive! How are you feeling today? Remember, you don't have to be perfect to be worthy of care and attention.",
          "Hi Slow Drive! Time for our daily check-in. Your feelings matter, even if you were taught they didn't. How has your day been so far?",
          "Hello Slow Drive! How are you doing today? It's okay to not be okay, and it's okay to ask for help when you need it.",
          "Good day Slow Drive! How are you feeling? I'm here whenever you need to talk, without judgment or expectations."
        ];
        
        const randomReminder = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
        setMessages(prev => [...prev, { sender: 'ai', text: randomReminder }]);
        setLastReminder(now);
      }
    };

    checkDailyReminder();
  }, [lastReminder]);

  // Add this near the top of your App component
  useEffect(() => {
    // Force voice list loading
    speechSynthesis.getVoices();
    
    // Handle voice loading
    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();
      console.log("Available voices loaded:", voices.length);
    };
  }, []);

  // Stop speaking function
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Enhanced speak function with realistic voice and emotion awareness
  const speak = (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Select the most natural-sounding voice with warm, friendly tone
      const naturalVoice = voices.find(voice => 
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('female') ||
        voice.name.includes('Female') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Victoria')
      );
      
      utterance.voice = naturalVoice || voices[0];

      // Enhanced voice configuration for warm, natural speech
      const voiceConfig = getEnhancedVoiceConfig(currentMood);
      utterance.rate = voiceConfig.rate;
      utterance.pitch = voiceConfig.pitch;
      utterance.volume = voiceConfig.volume;

      // Add natural pauses and emphasis for more human-like speech
      const sentences = text.split(/[.!?]+/).filter(Boolean);
      let enhancedText = '';
      sentences.forEach((sentence, index) => {
        if (index > 0) {
          enhancedText += '... ' + sentence.trim();
        } else {
          enhancedText = sentence.trim();
        }
      });
      utterance.text = enhancedText;

      // Add event listeners for better control
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      setIsSpeaking(false);
    }
  };

  // Get enhanced voice configuration for warm, natural speech
  const getEnhancedVoiceConfig = (mood) => {
    switch(mood) {
      case 'sad':
        return { rate: 0.85, pitch: 0.9, volume: 0.85 }; // Slower, softer, more comforting
      case 'angry':
        return { rate: 0.95, pitch: 1.0, volume: 0.9 }; // Normal pace, steady tone
      case 'happy':
        return { rate: 1.05, pitch: 1.15, volume: 1.0 }; // Slightly faster, brighter
      case 'anxious':
        return { rate: 0.9, pitch: 1.05, volume: 0.8 }; // Calmer, softer
      case 'calm':
        return { rate: 0.8, pitch: 0.95, volume: 0.9 }; // Very slow, gentle
      default:
        return { rate: 0.9, pitch: 1.05, volume: 0.95 }; // Natural, warm default
    }
  };

  // Detect mood from user input with trauma awareness
  const detectMood = (text) => {
    const lowerText = text.toLowerCase();
    
    // Trauma-specific triggers
    if (lowerText.includes('perfect') || lowerText.includes('failure') || lowerText.includes('exam') || lowerText.includes('grade')) {
      return 'anxious'; // Academic pressure triggers
    }
    
    if (lowerText.includes('parents') || lowerText.includes('family') || lowerText.includes('home') || lowerText.includes('neglect')) {
      return 'sad'; // Family trauma triggers
    }
    
    if (lowerText.includes('relationship') || lowerText.includes('love') || lowerText.includes('boyfriend') || lowerText.includes('rejection')) {
      return 'anxious'; // Relationship trauma triggers
    }
    
    if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('crying')) {
      return 'sad';
    } else if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('furious') || lowerText.includes('hate')) {
      return 'angry';
    } else if (lowerText.includes('happy') || lowerText.includes('excited') || lowerText.includes('great') || lowerText.includes('wonderful')) {
      return 'happy';
    } else if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('scared') || lowerText.includes('nervous')) {
      return 'anxious';
    } else if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed')) {
      return 'calm';
    }
    
    return 'neutral';
  };

  // Enhanced listening function
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    resetTranscript();
    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    });
    setIsListening(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const detectedMood = detectMood(userMessage);
    
    // Update mood tracking
    setCurrentMood(detectedMood);
    setMoodHistory(prev => [...prev, { 
      mood: detectedMood, 
      timestamp: new Date().toISOString(),
      message: userMessage.substring(0, 50) // Store first 50 chars
    }]);

    const newMessages = [...messages, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    resetTranscript();

    try {
      // Prepare context for the AI with trauma awareness
      const context = {
        message: userMessage,
        currentMood: detectedMood,
        moodHistory: moodHistory.slice(-5), // Last 5 mood entries
        userProfile: userProfile,
        lastSession: userProfile.lastSession,
        traumaAware: true
      };

      const res = await axios.post(`${API_BASE_URL}/message`, {
        message: userMessage,
        context: context,
        history: newMessages.map((msg) => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.text
        }))
      }, {
        timeout: 20000, // Reduced timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Crisis detection
      if (res.data.emergency) {
        setShowCrisis(true);
        setCrisisInfo(res.data);
        setMessages([...newMessages, { sender: 'ai', text: res.data.response }]);
        setSessionSummary('');
        setShowGratitude(false);
        setIsLoading(false);
        return;
      }
      // Normal session
      setMessages([...newMessages, { sender: 'ai', text: res.data.response }]);
      setSessionSummary(res.data.summary || '');
      setShowGratitude(res.data.gratitudePrompt || false);
      setShowCrisis(false);
      setCrisisInfo(null);
      
      // Update user profile with session info
      setUserProfile(prev => ({
        ...prev,
        lastSession: new Date().toISOString(),
        issues: [...prev.issues, { issue: userMessage, response: res.data.response, timestamp: new Date().toISOString() }]
      }));
      
      speak(res.data.response);  // Speak the AI's response
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
      setMessages([...newMessages, { sender: 'ai', text: errorMessage }]);
      speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Gratitude submit
  const submitGratitude = () => {
    setShowGratitude(false);
    setMessages(prev => [...prev, { sender: 'ai', text: 'Thank you for sharing your gratitude. This practice helps emotional health.' }]);
    setGratitudeList(['', '', '']);
  };

  // Trauma support component
  const TraumaSupport = () => (
    <div className="trauma-support">
      <h3>Safe Space Reminders</h3>
      <div className="support-tips">
        <div className="tip">
          <span className="tip-icon">💙</span>
          <span>Your feelings are valid, even if you were taught they weren't</span>
        </div>
        <div className="tip">
          <span className="tip-icon">🌟</span>
          <span>You don't have to be perfect to be worthy of love</span>
        </div>
        <div className="tip">
          <span className="tip-icon">🛡️</span>
          <span>Your survival strategies helped you, but you can heal now</span>
        </div>
        <div className="tip">
          <span className="tip-icon">🌱</span>
          <span>Healing is a journey, not a destination</span>
        </div>
      </div>
    </div>
  );

  // Mood tracking component
  const MoodTracker = () => (
    <div className="mood-tracker">
      <h3>How are you feeling today?</h3>
      <div className="mood-buttons">
        {['😊', '😢', '😠', '😰', '😌'].map((emoji, index) => {
          const moods = ['happy', 'sad', 'angry', 'anxious', 'calm'];
          return (
            <button
              key={index}
              onClick={() => setCurrentMood(moods[index])}
              className={`mood-button ${currentMood === moods[index] ? 'active' : ''}`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
      {moodHistory.length > 0 && (
        <div className="mood-history">
          <h4>Recent Moods:</h4>
          <div className="mood-timeline">
            {moodHistory.slice(-7).map((entry, index) => (
              <div key={index} className="mood-entry">
                <span className="mood-emoji">
                  {entry.mood === 'happy' ? '😊' : 
                   entry.mood === 'sad' ? '😢' : 
                   entry.mood === 'angry' ? '😠' : 
                   entry.mood === 'anxious' ? '😰' : '😌'}
                </span>
                <span className="mood-date">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Fetch journal entries
  useEffect(() => {
    axios.get(`${API_BASE_URL}/journal`).then(res => {
      setJournal(res.data || []);
    }).catch(() => {});
  }, []);

  // Journal UI
  const JournalPanel = () => (
    <div className="journal-panel">
      <h3>Therapy Journal</h3>
      <ul>
        {journal.slice(-10).reverse().map((entry, idx) => (
          <li key={idx}>
            <b>{new Date(entry.date).toLocaleString()}:</b> {entry.summary}
          </li>
        ))}
      </ul>
    </div>
  );

  // Crisis UI
  const CrisisPanel = () => crisisInfo && (
    <div className="crisis-panel">
      <h3>Emergency Help</h3>
      <p>{crisisInfo.response}</p>
      <ul>
        {crisisInfo.numbers && crisisInfo.numbers.map((n, i) => (
          <li key={i}><b>{n.label}:</b> {n.number}</li>
        ))}
      </ul>
      {crisisInfo.calmingAudio && (
        <audio controls src={crisisInfo.calmingAudio} style={{marginTop:8}}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );

  // Gratitude UI
  const GratitudePanel = () => (
    <div className="gratitude-panel">
      <h3>Gratitude Practice</h3>
      <p>Can you name 3 things you’re grateful for today?</p>
      <ol>
        {[0,1,2].map(i => (
          <li key={i}>
            <input type="text" value={gratitudeList[i]} onChange={e => {
              const arr = [...gratitudeList];
              arr[i] = e.target.value;
              setGratitudeList(arr);
            }} placeholder={`Grateful thing #${i+1}`}/>
          </li>
        ))}
      </ol>
      <button onClick={submitGratitude}>Submit</button>
    </div>
  );

  // Fetch voice memories
  useEffect(() => {
    axios.get(`${API_BASE_URL}/voice-memories`).then(res => {
      setVoiceMemories(res.data || []);
    }).catch(() => {});
  }, []);

  // Start recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Audio recording not supported in this browser.');
      return;
    }
    setRecordConsent(false);
    setAudioChunks([]);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    recorder.ondataavailable = e => {
      if (e.data.size > 0) setAudioChunks(prev => [...prev, e.data]);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      setRecordConsent(true);
    };
    setMediaRecorder(recorder);
    setRecording(true);
    recorder.start();
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // Save voice note
  const saveVoiceNote = async () => {
    if (!audioChunks.length) return;
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('voiceNote', blob, `voice_${Date.now()}.webm`);
    await axios.post(`${API_BASE_URL}/voice-memories`, formData);
    setAudioChunks([]);
    setRecordConsent(false);
    // Refresh list
    axios.get(`${API_BASE_URL}/voice-memories`).then(res => {
      setVoiceMemories(res.data || []);
    });
  };

  // Play voice note
  const playVoiceNote = async (id) => {
    const res = await axios.get(`${API_BASE_URL}/voice-memories/${id}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  // Voice Memories UI
  const VoiceMemoriesPanel = () => (
    <div className="voice-memories-panel">
      <h3>Voice Memories</h3>
      <audio ref={audioRef} controls style={{ width: '100%' }} />
      <ul>
        {voiceMemories.map((mem, idx) => (
          <li key={mem.id || idx}>
            <button onClick={() => playVoiceNote(mem.id)}>Play {mem.label || `Voice Note #${idx+1}`}</button>
            <span style={{marginLeft:8}}>{mem.date ? new Date(mem.date).toLocaleString() : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // Helper: get mood emoji
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'calm': return '😌';
      default: return '😐';
    }
  };

  // Helper: get mood by date
  const getMoodByDate = (dateStr) => {
    const entry = moodHistory.find(m => m.timestamp && new Date(m.timestamp).toDateString() === new Date(dateStr).toDateString());
    return entry ? getMoodEmoji(entry.mood) : '😐';
  };

  // Calendar UI
  const MoodCalendar = () => {
    // Show current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0=Sun
    const weeks = [];
    let day = 1 - startDay;
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++, day++) {
        if (day < 1 || day > daysInMonth) {
          week.push(null);
        } else {
          const dateStr = new Date(year, month, day).toISOString();
          week.push({ day, dateStr });
        }
      }
      weeks.push(week);
    }
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="mood-calendar-panel">
        <h3>Mood Calendar - {now.toLocaleString('default', { month: 'long' })} {year}</h3>
        <table className="mood-calendar-table">
          <thead>
            <tr>{weekDays.map(d => <th key={d}>{d}</th>)}</tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((cell, di) => (
                  <td key={di} className={cell ? 'mood-day' : 'empty-day'}>
                    {cell && <div>
                      <div className="mood-emoji-big">{getMoodByDate(cell.dateStr)}</div>
                      <div className="mood-day-num">{cell.day}</div>
                    </div>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="controls">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="theme-toggle"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button 
          onClick={() => setShowTraumaSupport(!showTraumaSupport)}
          className="support-toggle"
          title="Show/Hide Trauma Support"
        >
          🛡️
        </button>
        <button onClick={() => setShowJournal(!showJournal)} className="journal-toggle" title="Show/Hide Therapy Journal">
          📝
        </button>
        <button onClick={() => setShowVoiceMemories(!showVoiceMemories)} className="voice-memories-toggle" title="Show/Hide Voice Memories">
          🎤
        </button>
        <button onClick={() => setShowMoodCalendar(!showMoodCalendar)} className="mood-calendar-toggle" title="Show/Hide Mood Calendar">
          📆
        </button>
      </div>
      
      <div className="status-indicator">
        {serverStatus === 'connected' && <span className="status connected">🟢 Connected</span>}
        {serverStatus === 'demo' && <span className="status demo">🟡 Demo Mode</span>}
        {serverStatus === 'disconnected' && <span className="status disconnected">🔴 Backend Offline</span>}
        {serverStatus === 'checking' && <span className="status checking">⏳ Checking...</span>}
      </div>
      
      <div className="chat-box">
        <h1>Numa - AI Therapist</h1>
        
        {showTraumaSupport && <TraumaSupport />}
        {showJournal && <JournalPanel />}
        
        <MoodTracker />
        
        <div className="emotion-indicator">
          Current mood: {currentMood === 'neutral' ? '😊' : 
                          currentMood === 'happy' ? '😃' : 
                          currentMood === 'sad' ? '😢' : 
                          currentMood === 'angry' ? '😠' :
                          currentMood === 'anxious' ? '😰' : '😌'}
        </div>
        {showCrisis && <CrisisPanel />}
        
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <strong>{msg.sender === 'ai' ? 'Numa' : 'You'}:</strong> {msg.text}
            </div>
          ))}
          {isLoading && <div className="message ai loading">Numa is typing...</div>}
        </div>
        
        {sessionSummary && (
          <div className="session-summary">
            <b>Session Summary:</b> {sessionSummary}
          </div>
        )}
        {showGratitude && <GratitudePanel />}
        {showVoiceMemories && <VoiceMemoriesPanel />}
        {showMoodCalendar && <MoodCalendar />}
        
        <div className="input-area">
          <input
            type="text"
            placeholder="Speak or type here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={isListening ? stopListening : startListening}
            className={`mic-button ${isListening ? 'listening' : ''}`}
            disabled={!browserSupportsSpeechRecognition}
          >
            🎤
          </button>
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
          {isSpeaking && (
            <button 
              onClick={stopSpeaking}
              className="stop-button"
              title="Stop speaking"
            >
              🔇
            </button>
          )}
          {recording && (
            <button onClick={stopRecording} className="record-voice-btn">
              Stop Recording
            </button>
          )}
          {recordConsent && (
            <div className="voice-consent-panel">
              <p>Do you want to save this voice note to your memories?</p>
              <button onClick={saveVoiceNote}>Yes, Save</button>
              <button onClick={() => { setAudioChunks([]); setRecordConsent(false); }}>No, Discard</button>
              <audio controls src={URL.createObjectURL(new Blob(audioChunks, { type: 'audio/webm' }))} style={{ width: '100%' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
