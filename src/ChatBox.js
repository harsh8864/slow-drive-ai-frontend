import React, { useState } from "react";
import axios from "axios";

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi Priya, I'm your therapist. I know you're feeling confused and overwhelmed. I'm here to help, always." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToGemini = async (prompt) => {
    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
          process.env.REACT_APP_GEMINI_API_KEY,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }
      );

      if (!res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response');
      }

      return res.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("❌ Gemini API Error:", error.message);
      return "I'm sorry, I'm having trouble responding right now. Can we try again?";
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const prompt = `
        You are a calming, caring therapist talking to a girl named Priya. 
        She is often confused, overwhelmed, and quick-tempered, but you respond with love, patience, and empathy.
        This is her message: "${input}"
        Respond warmly and gently, like a close friend or therapist.
      `;

      const response = await sendMessageToGemini(prompt);
      setMessages(prev => [...prev, { role: "bot", text: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: "bot", text: "I'm sorry, something went wrong. Can we try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll", marginBottom: "10px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "8px" }}>
            <b>{msg.role === "bot" ? "AI" : "Priya"}:</b> {msg.text}
          </div>
        ))}
        {isLoading && <div style={{ color: "#666" }}>AI is typing...</div>}
      </div>
      <input
        style={{ width: "80%" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Speak or type here..."
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        disabled={isLoading}
      />
      <button onClick={sendMessage} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default ChatBox;
