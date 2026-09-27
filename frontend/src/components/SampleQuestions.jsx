import React, { useState } from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, ShieldAlert, Search, Filter } from 'lucide-react';

export const SampleQuestions = ({ questions, onSelectQuestion, disabled }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!questions || questions.length === 0) return null;

  // Extract unique categories
  const categories = ['All', ...new Set(questions.map((q) => q.category))];

  const filteredQuestions = questions.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="glass-panel sample-questions-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <HelpCircle size={16} className="text-cyan" />
          <h2>Evaluation Suite</h2>
        </div>
        <span className="count-pill">{questions.length} Questions</span>
      </div>

      <p className="panel-hint">
        Click any test question below to evaluate grounded retrieval and refusal behavior:
      </p>

      {/* Category Filter Pills */}
      <div className="category-scroll-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="question-chips">
        {filteredQuestions.length === 0 ? (
          <div className="no-questions-found">No test questions match your search.</div>
        ) : (
          filteredQuestions.map((item) => (
            <button
              key={item.id}
              type="button"
              className="question-chip"
              onClick={() => onSelectQuestion(item.question)}
              disabled={disabled}
              title={item.inDocument ? 'Grounded in Acme Handbook' : 'Tests out-of-document refusal behavior'}
            >
              <div className="chip-top-row">
                <div
                  className={`chip-tag ${item.inDocument ? 'in-doc' : 'out-scope'}`}
                >
                  {item.inDocument ? (
                    <>
                      <CheckCircle2 size={11} />
                      <span>{item.category}</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={11} />
                      <span>{item.category} (Refusal Test)</span>
                    </>
                  )}
                </div>
                <ChevronRight size={13} className="chip-arrow" />
              </div>
              <span className="chip-question-text">{item.question}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
