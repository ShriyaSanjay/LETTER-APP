import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [currentText, setCurrentText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [letterCount, setLetterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch existing content on component mount
  useEffect(() => {
    fetchCurrentContent();
  }, []);

  const fetchCurrentContent = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/letters`);
      const content = response.data.content;
      setCurrentText(content);
      setDisplayText(content);
      updateCounts(content);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const updateCounts = (text) => {
    const words = text.split(' ').filter(word => word.length > 0);
    const totalLetters = text.replace(/\s/g, '').length;
    setWordCount(words.length);
    setLetterCount(totalLetters);
  };

  const handleLetterInput = async (letter) => {
    const currentWords = currentText.split(' ').filter(word => word.length > 0);
    const totalLetters = currentText.replace(/\s/g, '').length;
    
    // If we have 4 words, start deletion mode
    if (currentWords.length === 4 && totalLetters >= 16) {
      // Find the last letter in the entire string
      const lastLetter = currentText.replace(/\s/g, '').slice(-1);
      
      // Only delete if the typed letter matches the last letter
      if (letter === lastLetter) {
        // Remove the last letter from the entire string
        let lettersWithoutSpaces = currentText.replace(/\s/g, '');
        lettersWithoutSpaces = lettersWithoutSpaces.slice(0, -1);
        
        // Reconstruct the text with proper spacing
        const newWords = [];
        for (let i = 0; i < lettersWithoutSpaces.length; i += 4) {
          newWords.push(lettersWithoutSpaces.slice(i, i + 4));
        }
        
        const newText = newWords.join(' ');
        
        try {
          await axios.post(`${API_BASE_URL}/letters`, { content: newText });
          setCurrentText(newText);
          setDisplayText(newText);
          updateCounts(newText);
        } catch (error) {
          console.error('Error saving letter:', error);
        }
      }
      // If the letter doesn't match, do nothing
      return;
    }
    
    // Normal letter input logic for less than 4 words
    let newText = currentText + letter;
    
    // Add space after every 4 letters
    const lettersWithoutSpaces = newText.replace(/\s/g, '');
    const words = [];
    
    for (let i = 0; i < lettersWithoutSpaces.length; i += 4) {
      words.push(lettersWithoutSpaces.slice(i, i + 4));
    }
    
    newText = words.join(' ');
    
    try {
      await axios.post(`${API_BASE_URL}/letters`, { content: newText });
      setCurrentText(newText);
      setDisplayText(newText);
      updateCounts(newText);
    } catch (error) {
      console.error('Error saving letter:', error);
    }
  };

  const handleDelete = async () => {
    const words = currentText.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return;
    
    const lastWord = words[words.length - 1];
    
    // If we have 4 complete words (16 letters total), always delete the entire last word
    if (words.length === 4 && lastWord.length === 4) {
      words.pop();
      const newText = words.join(' ');
      
      try {
        await axios.post(`${API_BASE_URL}/letters`, { content: newText });
        setCurrentText(newText);
        setDisplayText(newText);
        updateCounts(newText);
      } catch (error) {
        console.error('Error deleting letter:', error);
      }
    } else if (lastWord.length === 1) {
      // Remove the entire last word if it only has 1 letter
      words.pop();
      const newText = words.join(' ');
      
      try {
        await axios.post(`${API_BASE_URL}/letters`, { content: newText });
        setCurrentText(newText);
        setDisplayText(newText);
        updateCounts(newText);
      } catch (error) {
        console.error('Error deleting letter:', error);
      }
    } else {
      // Remove last letter from the last word
      const newLastWord = lastWord.slice(0, -1);
      words[words.length - 1] = newLastWord;
      const newText = words.join(' ');
      
      try {
        await axios.post(`${API_BASE_URL}/letters`, { content: newText });
        setCurrentText(newText);
        setDisplayText(newText);
        updateCounts(newText);
      } catch (error) {
        console.error('Error deleting letter:', error);
      }
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/letters`);
      setCurrentText('');
      setDisplayText('');
      setLetterCount(0);
      setWordCount(0);
    } catch (error) {
      console.error('Error clearing all:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleDelete();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleClearAll();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      handleLetterInput(e.key.toLowerCase());
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="display-area">
          <h2>Current Text:</h2>
          <div className="text-display">
            {displayText || <span className="placeholder">Start typing letters...</span>}
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Letters:</span>
            <span className="stat-value">{letterCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Words:</span>
            <span className="stat-value">{wordCount}/4</span>
          </div>
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type letters here..."
            onKeyDown={handleKeyPress}
            className="letter-input"
            autoFocus
          />
        </div>

        <div className="button-area">
          <button onClick={handleClearAll} className="clear-btn">
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
