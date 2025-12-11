import React, { useState } from 'react';
import { Container, Card, Form, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m your shopping assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/chatbot', {
        message: input
      });

      const botMessage = { sender: 'bot', text: response.data.message };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        sender: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '700px' }}>
      <h2 className="mb-4">Chat Support</h2>
      
      <Card>
        <Card.Body style={{ height: '500px', overflowY: 'auto' }}>
          <ListGroup variant="flush">
            {messages.map((msg, index) => (
              <ListGroup.Item
                key={index}
                className={`border-0 ${msg.sender === 'user' ? 'text-end' : ''}`}
              >
                <div
                  className={`d-inline-block p-2 rounded ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-light'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  {msg.text}
                </div>
              </ListGroup.Item>
            ))}
            {loading && (
              <ListGroup.Item className="border-0">
                <div className="d-inline-block p-2 rounded bg-light">
                  Typing...
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
        
        <Card.Footer>
          <Form onSubmit={handleSubmit}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                Send
              </Button>
            </div>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default Chatbot;