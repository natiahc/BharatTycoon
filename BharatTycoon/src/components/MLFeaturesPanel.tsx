import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const MLFeaturesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'sentiment' | 'advice' | 'translate' | 'qa'>('search');
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkMLStatus();
  }, []);

  const checkMLStatus = async () => {
    try {
      const status = await api.ml.status();
      setMlStatus(status);
    } catch (err) {
      console.error('ML Status check failed:', err);
    }
  };

  return (
    <div className="ml-features-panel">
      <div className="panel-header">
        <h2>AI Features</h2>
        <div className="status-indicators">
          {mlStatus?.semantic_search?.loaded && <span className="status-dot active" title="Semantic Search" />}
          {mlStatus?.news_intelligence?.loaded && <span className="status-dot active" title="News AI" />}
          {mlStatus?.text_generation?.available && <span className="status-dot active" title="Text Generation" />}
        </div>
      </div>

      <div className="tabs">
        {[
          { id: 'search', label: 'Search' },
          { id: 'sentiment', label: 'Sentiment' },
          { id: 'advice', label: 'AI Advice' },
          { id: 'translate', label: 'Translate' },
          { id: 'qa', label: 'Q&A' },
        ].map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id as any)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'search' && <SemanticSearchTab />}
      {activeTab === 'sentiment' && <SentimentTab />}
      {activeTab === 'advice' && <AIBusinessAdviceTab />}
      {activeTab === 'translate' && <TranslationTab />}
      {activeTab === 'qa' && <QATab />}
    </div>
  );
};

const SemanticSearchTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.ml.search(query);
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="input-group">
        <input
          type="text"
          placeholder="Try: 'delhi cafe' or 'mumbai tech startup'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div className="results">
        {results.map((r, i) => (
          <div key={i} className="result-item">
            <span className="result-type">{r.type}</span>
            <span className="result-name">{r.name}</span>
            {r.state && <span className="result-state">{r.state}</span>}
            <span className="result-score">{r.score?.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SentimentTab: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await api.ml.sentiment(text);
      setResult(data.sentiment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <textarea
        placeholder="Enter text to analyze sentiment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Sentiment'}
      </button>
      {result && (
        <div className={`sentiment-result ${result.label}`}>
          <span className="sentiment-label">{result.label}</span>
          <span className="sentiment-score">Score: {(result.score * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

const AIBusinessAdviceTab: React.FC = () => {
  const [context, setContext] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (!context.trim()) return;
    setLoading(true);
    try {
      const data = await api.ai.advice(context);
      setAdvice(data.advice || 'AI unavailable');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickTopics = ['restaurant in Mumbai', 'franchise opportunity', 'tech startup', 'retail shop'];

  return (
    <div className="tab-content">
      <input
        type="text"
        placeholder="Ask for business advice..."
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <div className="quick-topics">
        {quickTopics.map((topic) => (
          <button key={topic} className="topic-chip" onClick={() => setContext(topic)}>
            {topic}
          </button>
        ))}
      </div>
      <button onClick={handleGetAdvice} disabled={loading}>
        {loading ? 'Generating...' : 'Get AI Advice'}
      </button>
      {advice && <div className="advice-result">{advice}</div>}
    </div>
  );
};

const TranslationTab: React.FC = () => {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await api.ai.translateHindi(text);
      setTranslated(data.hindi || 'Translation unavailable');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <textarea
        placeholder="Enter English text to translate to Hindi..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate to Hindi'}
      </button>
      {translated && (
        <div className="translation-result">
          <label>Hindi:</label>
          <p>{translated}</p>
        </div>
      )}
    </div>
  );
};

const QATab: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const data = await api.ai.answerQuestion(question, 'restaurant');
      setAnswer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What are the profit margins?',
    'How much should I invest?',
    'What are the main risks?',
  ];

  return (
    <div className="tab-content">
      <input
        type="text"
        placeholder="Ask a business question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="suggested-questions">
        {suggestedQuestions.map((q) => (
          <button key={q} className="topic-chip" onClick={() => setQuestion(q)}>
            {q}
          </button>
        ))}
      </div>
      <button onClick={handleAsk} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask AI'}
      </button>
      {answer && (
        <div className="qa-result">
          <p className="answer">{answer.answer}</p>
          <span className="confidence">Confidence: {(answer.confidence * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

export default MLFeaturesPanel;
