import React, { useState, useCallback } from 'react';
// FIX: The function `generateAcademyLesson` does not exist. It should be `generateGuidance`.
// FIX: Import missing types for lesson data.
import { generateGuidance, ComicPanelData, QuoteData, FlashcardData, MindMapNode } from '../services/geminiService';
import StoryDisplay from './StoryDisplay';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { useLocalization } from '../hooks/useLocalization';

const ConceptExplainer: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  // FIX: Renamed state variables to match the `StoryDisplay` props and the response from `generateGuidance`.
  const [gentleAdvice, setGentleAdvice] = useState<string>('');
  const [comicPanels, setComicPanels] = useState<ComicPanelData[]>([]);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [furtherReading, setFurtherReading] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLocalization();

  // FIX: Create a function to reset all lesson state.
  const resetLesson = () => {
    setQuote(null);
    setGentleAdvice('');
    setFurtherReading([]);
    setComicPanels([]);
    setFlashcards([]);
    setMindMap(null);
  };

  const handleGeneration = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a concept to explain.");
      return;
    }
    setIsLoading(true);
    setError(null);
    // FIX: Reset all lesson content before generating a new one.
    resetLesson();

    try {
      // FIX: Call the correct `generateGuidance` function instead of the non-existent `generateAcademyLesson`.
      // FIX: Pass the 'language' argument to satisfy the function's signature.
      const result = await generateGuidance(topic, language);
      // FIX: Set all parts of the lesson from the API response, using the correct property names.
      setQuote(result.quote);
      setGentleAdvice(result.gentleAdvice);
      setFurtherReading(result.furtherReading);
      setComicPanels(result.comicPanels);
      setFlashcards(result.flashcards);
      setMindMap(result.mindMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic, language]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGeneration();
    }
  };

  // FIX: Create a helper variable to check if there is any content to display.
  // This check ensures `quote` and `mindMap` are not null, satisfying StoryDisplay's prop types.
  const hasContent = quote && mindMap;

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg border border-amber-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a concept (e.g., 'Global Village')"
          className="flex-grow w-full px-5 py-3 text-lg bg-amber-50 border-2 border-amber-300 rounded-full focus:ring-4 focus:ring-amber-300 focus:border-amber-500 focus:outline-none transition duration-300 placeholder-slate-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGeneration}
          disabled={isLoading || !topic.trim()}
          className="px-8 py-3 bg-amber-600 text-white text-lg font-bold rounded-full shadow-md hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition duration-300"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className="mt-8 min-h-[200px] flex items-center justify-center">
        {isLoading && <Loader />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        {/* FIX: Use `hasContent` and pass all required props to StoryDisplay to fix the type error. */}
        {hasContent && !isLoading && (
          <StoryDisplay
            // FIX: Removed `topic` prop as it is not expected by `StoryDisplay`.
            // FIX: Pass correctly named props (`gentleAdvice`, `furtherReading`).
            quote={quote}
            gentleAdvice={gentleAdvice}
            furtherReading={furtherReading}
            comicPanels={comicPanels}
            flashcards={flashcards}
            mindMap={mindMap}
          />
        )}
        {/* FIX: Use `hasContent` to determine whether to show the welcome message. */}
        {!isLoading && !error && !hasContent && (
          <div className="text-center text-slate-500">
            <p className="text-xl">Welcome to Concept Comics! 💡</p>
            <p className="mt-2">Enter any topic, and we'll provide a clear explanation and an illustrative comic.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptExplainer;
