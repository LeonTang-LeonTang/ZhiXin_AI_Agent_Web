import React, { useState, useCallback, useEffect } from 'react';
import { generateGuidance, getCharacterDescription, GuidanceContent } from '../services/geminiService';
import GuidanceDisplay from './StoryDisplay';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { useLocalization, Language } from '../hooks/useLocalization';

interface CompanionInputProps {
  initialContent: GuidanceContent | null;
  onShare: (content: GuidanceContent) => void;
  language: Language;
}

const CompanionInput: React.FC<CompanionInputProps> = ({ initialContent, onShare, language }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [guidance, setGuidance] = useState<GuidanceContent | null>(initialContent);
  const [uploadedImage, setUploadedImage] = useState<{file: File, dataUrl: string} | null>(null);
  const { t } = useLocalization();
  
  useEffect(() => {
    setGuidance(initialContent);
  }, [initialContent]);

  const resetGuidance = () => {
    setGuidance(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage({ file, dataUrl: e.target?.result as string });
            setError(null);
        };
        reader.readAsDataURL(file);
    } else if (file) {
        setError("Unsupported file. Please upload an image (e.g., .png, .jpg).");
        setUploadedImage(null);
    }
  };
  
  const clearFile = () => {
    setUploadedImage(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleGeneration = useCallback(async () => {
    if (!userInput.trim()) {
      setError(t('errorEnterConcept'));
      return;
    }
    setIsLoading(true);
    setError(null);
    resetGuidance();

    try {
        let characterDesc: string | undefined = undefined;
        if (uploadedImage) {
            const base64Data = uploadedImage.dataUrl.split(',')[1];
            characterDesc = await getCharacterDescription(base64Data, uploadedImage.file.type);
        }

      const result = await generateGuidance(userInput, language, characterDesc);
      
      const newGuidance: GuidanceContent = {
        ...result,
        id: self.crypto.randomUUID(),
        characterImage: uploadedImage?.dataUrl,
        characterFileName: uploadedImage?.file.name,
        likes: 0,
        dislikes: 0,
      }
      setGuidance(newGuidance);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorUnexpected');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, uploadedImage, language, t]);
  
  const hasContent = guidance !== null;

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg border border-amber-200">
      <div className="flex flex-col gap-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={t('explainerPlaceholder')}
          className="flex-grow w-full px-5 py-3 text-lg bg-amber-50 border-2 border-amber-300 rounded-2xl focus:ring-4 focus:ring-amber-300 focus:border-amber-500 focus:outline-none transition duration-300 placeholder-slate-500"
          disabled={isLoading}
          rows={4}
        />
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-grow text-center sm:text-left">
                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                {uploadedImage ? (
                    <div className="inline-flex items-center gap-2 bg-amber-100 p-2 rounded-full border border-amber-300">
                        <img src={uploadedImage.dataUrl} alt="Character preview" className="w-10 h-10 rounded-full object-cover" />
                        <span className="text-sm text-slate-700 font-sans">{t('usingFileLabel')} {uploadedImage.file.name}</span>
                        <button onClick={clearFile} disabled={isLoading} className="text-amber-600 hover:text-amber-800 font-bold text-lg leading-none align-middle pr-2">&times;</button>
                    </div>
                ) : (
                    <label htmlFor="file-upload" className={`text-sm text-slate-600 inline-flex items-center bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-full border border-amber-200 transition-colors ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {t('uploadLabel')}
                    </label>
                )}
            </div>
            <button
              onClick={handleGeneration}
              disabled={isLoading || !userInput.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-amber-600 text-white text-lg font-bold rounded-full shadow-md hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition duration-300"
            >
              {isLoading ? t('explainButtonLoading') : t('explainButton')}
            </button>
        </div>
      </div>
      
      <div className="mt-8 min-h-[200px] flex items-center justify-center">
        {isLoading && <Loader />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        {hasContent && !isLoading && (
          <GuidanceDisplay {...guidance!} onShare={() => onShare(guidance!)} />
        )}
        {!isLoading && !error && !hasContent && (
          <div className="text-center text-slate-500">
            <p className="text-xl">{t('welcomeTitle')} ❤️</p>
            <p className="mt-2">{t('welcomeMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanionInput;
