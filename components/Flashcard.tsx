import React, { useState } from 'react';

interface FlashcardProps {
  term: string;
  definition: string;
  isEditable: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ term, definition, isEditable }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const formattedDefinition = definition.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-bold text-amber-800">$1</strong>'
  );

  return (
    <div
      className="group w-full h-64 [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full rounded-xl shadow-md transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full bg-white border border-amber-200 rounded-xl flex items-center justify-center p-4 [backface-visibility:hidden]">
          <h3
            className="text-2xl font-bold text-amber-800 text-center"
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onClick={(e) => isEditable && e.stopPropagation()}
          >
            {term}
          </h3>
        </div>
        
        {/* Back of Card */}
        <div className="absolute w-full h-full bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div
            className="text-slate-700 text-left font-sans w-full"
            contentEditable={isEditable}
            suppressContentEditableWarning={true}
            onClick={(e) => isEditable && e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: formattedDefinition }}
          />
        </div>
      </div>
    </div>
  );
};

export default Flashcard;