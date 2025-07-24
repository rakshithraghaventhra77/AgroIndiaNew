import React, { useState, useEffect, useRef } from 'react';
import { useState as useStateHook } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Loader2,
  Check,
  X,
  MessageCircle,
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDetectDisease } from '../utils/mockAI';
import { storage } from '../utils/storage';
import { DetectionResult } from '../types';
import ChatAssistant from '../components/ChatAssistant';

const crops = [
  { id: 'tomato', name: 'crops.tomato', icon: '🍅' },
  { id: 'potato', name: 'crops.potato', icon: '🥔' },
  { id: 'wheat', name: 'crops.wheat', icon: '🌾' },
  { id: 'rice', name: 'crops.rice', icon: '🌾' },
  { id: 'corn', name: 'crops.corn', icon: '🌽' },
  { id: 'cotton', name: 'crops.cotton', icon: '🌱' },
  { id: 'sugarcane', name: 'crops.sugarcane', icon: '🎋' },
  { id: 'soybean', name: 'crops.soybean', icon: '🌿' }
];

const photoTips = [
  'Take photo in good natural lighting (avoid harsh shadows).',
  'Use a plain background if possible.',
  'Focus on the affected area of the crop.',
  'Hold the camera steady and avoid blur.',
  'Fill the frame with the crop, but keep the whole leaf/fruit visible.'
];

const scanMessages = [
  'Analyzing your crop photo…',
  'Looking for signs of disease…',
  'Comparing with healthy crops…',
  'Almost done!'
];

const LeafScan: React.FC = () => (
  <svg className="w-12 h-12 animate-leaf-sway" viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="34" rx="16" ry="6" fill="#22c55e" opacity="0.15" />
    <path d="M20 35C28 25 36 10 20 5C4 10 12 25 20 35Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" />
    <path d="M20 35V10" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    {/* Scanning line */}
    <rect x="10" y="18" width="20" height="4" rx="2" fill="#4ade80" opacity="0.5">
      <animate attributeName="y" values="10;26;10" dur="1.2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const UploadPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [scanMsgIdx, setScanMsgIdx] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setScanMsgIdx((idx) => (idx + 1) % scanMessages.length);
      }, 1200);
      return () => clearInterval(interval);
    } else {
      setScanMsgIdx(0);
    }
  }, [isProcessing]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDetection = async () => {
    if (!selectedFile || !selectedCrop) {
      setError('Please select both a crop type and an image');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result: DetectionResult = await mockDetectDisease(selectedFile, selectedCrop, language);
      storage.saveDetection(result);
      navigate('/result', { state: { result } });
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
            {t('upload.title')}
          </h1>
          <p className="text-lg text-green-600">
            {t('upload.subtitle')}
          </p>
        </div>

        {/* Crop Selection */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-green-800 mb-4">
            {t('upload.crop.label')}
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full p-4 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors text-lg"
          >
            <option value="">{t('upload.crop.placeholder')}</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.icon} {t(crop.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload Area */}
        <label className="block text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
          Upload Crop Image
          <button
            type="button"
            className="ml-2 p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Tips for good photo"
            onClick={() => setShowTips(true)}
          >
            <Info className="w-5 h-5" />
          </button>
        </label>

        {/* Tips Modal */}
        {showTips && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full relative">
              <button
                className="absolute top-2 right-2 text-green-700 hover:text-green-900"
                onClick={() => setShowTips(false)}
                aria-label="Close tips"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-green-800 mb-4">Tips for a Good Photo</h2>
              <ul className="list-disc pl-5 space-y-2 text-green-700 text-base">
                {photoTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-green-500 bg-green-50' 
              : selectedFile 
                ? 'border-green-400 bg-green-25' 
                : 'border-green-200 hover:border-green-400 hover:bg-green-25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-16 h-16 text-green-400" />
              </div>
              <div className="text-lg text-green-600">
                {t('upload.drop.text')}
              </div>
              <div className="text-sm text-green-500">
                {t('upload.drop.formats')}
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {/* Upload Buttons */}
        <div className="flex gap-4 mt-6 mb-8 flex-wrap justify-center">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>{t('upload.camera')}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-6 rounded-lg transition-colors border border-green-300"
          >
            <ImageIcon className="w-5 h-5" />
            <span>{t('upload.gallery')}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Detect Button */}
        <button
          onClick={handleDetection}
          disabled={!selectedFile || !selectedCrop || isProcessing}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            !selectedFile || !selectedCrop || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <LeafScan />
              <span className="text-green-700 font-medium">{scanMessages[scanMsgIdx]}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-6 h-6" />
              <span>{t('upload.detect')}</span>
            </div>
          )}
        </button>

        {/* Chat Assistant */}
        <ChatAssistant 
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
    </div>
  );
};

export default UploadPage;