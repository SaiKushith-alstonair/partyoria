import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  question_type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'radio';
  options?: string[];
  placeholder?: string;
  min_value?: number;
  max_value?: number;
  is_required: boolean;
  order: number;
}

interface Requirement {
  id: string;
  label: string;
  category: string;
}

interface RequirementQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: {
    id: string;
    label: string;
  };
  eventId?: string;
  eventType?: string;
  onSave: (answers: Record<string, any>) => void;
}

const RequirementQuestionsModal: React.FC<RequirementQuestionsModalProps> = ({
  isOpen,
  onClose,
  requirement,
  eventId,
  eventType,
  onSave
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'gallery' | 'questions'>('gallery');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const fetchGalleryImages = async (requirementId: string) => {
    setLoadingImages(true);
    try {
      const eventName = eventId || eventType?.toLowerCase().replace(/\s+/g, '-') || 'conference';
      const response = await fetch(`http://localhost:8000/api/events/requirement-images/?requirement_name=${requirementId}&event_name=${eventName}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setGalleryImages(data.images);
          console.log(`Found ${data.images.length} images for ${requirementId} in ${eventName}`);
        } else {
          setGalleryImages([]);
        }
      } else {
        setGalleryImages([]);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setGalleryImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (isOpen && requirement.id) {
      setCurrentImageIndex(0);
      fetchGalleryImages(requirement.id);
      fetchQuestions();
    }
  }, [isOpen, requirement.id, eventId, eventType]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setCurrentView('gallery');
    } else {
      setCurrentView('questions');
    }
  }, [galleryImages]);

  const getFallbackQuestions = (requirementId: string): Question[] => {
    console.log('🔄 Getting fallback questions for requirement ID:', requirementId);
    
    // Wedding Cake specific questions
    if (requirementId.includes('wedding-cake') || requirementId.includes('cake')) {
      return [
        { id: 1, question_text: 'How many tiers do you want for your wedding cake?', question_type: 'dropdown', options: ['1 Tier', '2 Tiers', '3 Tiers', '4 Tiers', '5+ Tiers'], is_required: true, order: 1 },
        { id: 2, question_text: 'What cake flavor would you prefer?', question_type: 'dropdown', options: ['Vanilla', 'Chocolate', 'Red Velvet', 'Strawberry', 'Butterscotch', 'Black Forest', 'Fruit Cake', 'Custom Flavor'], is_required: true, order: 2 },
        { id: 3, question_text: 'What type of cake design do you want?', question_type: 'dropdown', options: ['Simple & Elegant', 'Floral Decorations', 'Fondant Design', 'Buttercream Roses', 'Theme-based Design', 'Photo Cake', 'Naked Cake Style'], is_required: true, order: 3 },
        { id: 4, question_text: 'What is your preferred cake size?', question_type: 'dropdown', options: ['1-2 kg (serves 10-15)', '2-3 kg (serves 20-25)', '3-5 kg (serves 30-40)', '5-8 kg (serves 50-60)', '8+ kg (serves 70+)'], is_required: true, order: 4 },
        { id: 5, question_text: 'Any special dietary requirements for the cake?', question_type: 'checkbox', options: ['Eggless', 'Sugar-free', 'Gluten-free', 'Vegan', 'Nut-free', 'No special requirements'], is_required: false, order: 5 }
      ];
    }
    
    // Environmental/Tree Planting specific questions
    if (requirementId.includes('tree') || requirementId.includes('plant') || requirementId.includes('landscap')) {
      return [
        { id: 1, question_text: 'How many trees do you want to plant?', question_type: 'number', min_value: 1, max_value: 1000, is_required: true, order: 1, placeholder: 'Number of saplings' },
        { id: 2, question_text: 'What type of trees would you prefer?', question_type: 'dropdown', options: ['Native Species', 'Fruit Trees', 'Flowering Trees', 'Fast Growing Trees', 'Mixed Variety'], is_required: false, order: 2 },
        { id: 3, question_text: 'Do you have a preferred planting location?', question_type: 'text', placeholder: 'Describe the area or let us suggest suitable locations', is_required: false, order: 3 }
      ];
    }
    
    // Tools/Equipment for environmental events
    if (requirementId.includes('tools') || requirementId.includes('equipment')) {
      return [
        { id: 1, question_text: 'What type of tools do you need?', question_type: 'checkbox', options: ['Shovels & Spades', 'Watering Equipment', 'Mulch & Compost', 'Protective Gear', 'Measuring Tools'], is_required: true, order: 1 },
        { id: 2, question_text: 'How many volunteers will participate?', question_type: 'number', min_value: 1, max_value: 500, is_required: true, order: 2, placeholder: 'Number of participants' }
      ];
    }
    
    // Default fallback for other requirements - make them more generic and relevant
    const fallbackQuestions = [
      { id: 1, question_text: `How many ${requirement.label.toLowerCase()} do you need?`, question_type: 'number', min_value: 1, max_value: 100, is_required: true, order: 1, placeholder: 'Enter quantity' },
      { id: 2, question_text: `What are your specific preferences for ${requirement.label.toLowerCase()}?`, question_type: 'text', placeholder: `Describe your requirements for ${requirement.label.toLowerCase()}`, is_required: false, order: 2 },
      { id: 3, question_text: `How important is ${requirement.label.toLowerCase()} for your event?`, question_type: 'dropdown', options: ['Very Important', 'Important', 'Somewhat Important', 'Nice to Have'], is_required: false, order: 3 }
    ];
    
    console.log('📝 Generated fallback questions:', fallbackQuestions);
    return fallbackQuestions;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/events/requirement-questions/?requirement_id=${requirement.id}`;
      console.log('Fetching questions from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API response:', data);
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        const initialAnswers: Record<string, any> = {};
        data.questions.forEach((q: Question) => {
          initialAnswers[q.id] = q.question_type === 'checkbox' ? [] : '';
        });
        setAnswers(initialAnswers);
        console.log(`✅ Loaded ${data.questions.length} questions from database`);
      } else {
        console.warn('No questions found in database, using fallback');
        const fallbackQuestions = getFallbackQuestions(requirement.id);
        setQuestions(fallbackQuestions);
        const initialAnswers: Record<string, any> = {};
        fallbackQuestions.forEach((q: Question) => {
          initialAnswers[q.id] = q.question_type === 'checkbox' ? [] : '';
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      const fallbackQuestions = getFallbackQuestions(requirement.id);
      setQuestions(fallbackQuestions);
      const initialAnswers: Record<string, any> = {};
      fallbackQuestions.forEach((q: Question) => {
        initialAnswers[q.id] = q.question_type === 'checkbox' ? [] : '';
      });
      setAnswers(initialAnswers);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: number, option: string, checked: boolean) => {
    setAnswers(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((v: string) => v !== option)
        };
      }
    });
  };



  const handleSave = () => {
    // Save answers with requirement details
    const savedData = {
      requirementId: requirement.id,
      requirementLabel: requirement.label,
      answers: answers,
      questions: questions
    };
    onSave(savedData);
    onClose();
  };

  const renderQuestion = (question: Question) => {
    switch (question.question_type) {
      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Please provide details...'}
            rows={3}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 bg-white shadow-sm transition-all duration-200 hover:border-purple-200 resize-none"
          />
        );

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value) || '')}
              min={question.min_value}
              max={question.max_value}
              placeholder={question.placeholder || 'Enter quantity'}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 bg-white shadow-sm transition-all duration-200 hover:border-purple-200"
            />
            {(question.min_value || question.max_value) && (
              <p className="text-xs text-gray-500 mt-1">
                {question.min_value && question.max_value 
                  ? `Range: ${question.min_value} - ${question.max_value}`
                  : question.min_value 
                  ? `Minimum: ${question.min_value}`
                  : `Maximum: ${question.max_value}`
                }
              </p>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 bg-white shadow-sm transition-all duration-200 hover:border-purple-200"
          >
            <option value="">Select an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option} className="py-2">
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="grid gap-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer border-2 border-transparent hover:border-purple-200">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="text-purple-600 focus:ring-purple-500 mr-3"
                />
                <span className="font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="grid gap-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer border-2 border-transparent hover:border-purple-200">
                <input
                  type="checkbox"
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                  className="text-purple-600 focus:ring-purple-500 mr-3"
                />
                <span className="font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center p-4" 
      style={{ zIndex: 99999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Modal backdrop clicked');
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {requirement.label} - Additional Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentView === 'gallery' && galleryImages.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                    <span>🖼️</span> {requirement.label} Gallery
                  </h3>
                  {loadingImages ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="relative flex items-center justify-center">
                        {galleryImages.length > 1 && (
                          <button
                            onClick={() => setCurrentImageIndex(prev => prev === 0 ? galleryImages.length - 1 : prev - 1)}
                            className="absolute left-4 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                          >
                            ←
                          </button>
                        )}
                        <div className="w-full max-w-lg">
                          <img
                            src={galleryImages[currentImageIndex]}
                            alt={`${requirement.label} ${currentImageIndex + 1}`}
                            className="w-full h-80 object-cover rounded-xl border-3 border-gray-200 shadow-xl"
                            onLoad={() => console.log('Image loaded successfully:', galleryImages[currentImageIndex])}
                            onError={(e) => {
                              console.error('Image failed to load:', galleryImages[currentImageIndex]);
                              e.currentTarget.src = 'https://via.placeholder.com/400x320/f3f4f6/9ca3af?text=Image+Not+Available';
                            }}
                          />
                        </div>
                        {galleryImages.length > 1 && (
                          <button
                            onClick={() => setCurrentImageIndex(prev => prev === galleryImages.length - 1 ? 0 : prev + 1)}
                            className="absolute right-4 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
                          >
                            →
                          </button>
                        )}
                      </div>
                      {galleryImages.length > 1 && (
                        <div className="flex justify-center mt-4 gap-2">
                          {galleryImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentImageIndex ? 'bg-purple-500' : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-center text-gray-600 italic mt-6 text-lg">
                        Style {currentImageIndex + 1} of {galleryImages.length} - {requirement.label.toLowerCase()}
                      </p>
                    </>
                  )}
                </div>
              )}

              {currentView === 'questions' && (
                <div className="space-y-6">
                  {questions.length > 0 ? (
                    <>
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                          <span>📋</span> {requirement.label} - Detailed Requirements
                        </h3>
                        <p className="text-gray-600">Please provide specific details to help us serve you better</p>
                      </div>
                      
                      <div className="grid gap-6">
                        {questions.map((question, index) => (
                          <div key={question.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1 space-y-3">
                                <label className="block text-lg font-semibold text-gray-800">
                                  {question.question_text}
                                  {question.is_required && (
                                    <span className="ml-2 text-red-500 text-sm font-normal">(Required)</span>
                                  )}
                                </label>
                                <div className="mt-3">
                                  {renderQuestion(question)}
                                </div>
                                {question.placeholder && question.question_type === 'text' && (
                                  <p className="text-sm text-gray-500 italic mt-1">
                                    💡 Tip: {question.placeholder}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">💡</span>
                          <h4 className="text-lg font-semibold text-gray-800">Why do we ask these questions?</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          These specific details help us provide accurate quotes, recommend the right vendors, 
                          and ensure your event requirements are perfectly matched with available services.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Additional Questions</h3>
                      <p className="text-gray-600">This requirement doesn't need additional details at this time.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => {
              if (currentView === 'questions' && galleryImages.length > 0) {
                setCurrentView('gallery');
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 text-gray-600 hover:text-gray-800 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 hover:shadow-lg hover:-translate-x-1"
          >
            ← {currentView === 'questions' && galleryImages.length > 0 ? 'Gallery' : 'Back'}
          </button>
          <button
            onClick={() => {
              if (currentView === 'gallery') {
                setCurrentView('questions');
              } else {
                handleSave();
              }
            }}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:translate-x-1 hover:-translate-y-1 disabled:opacity-50"
          >
            {currentView === 'gallery' ? 'Continue →' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RequirementQuestionsModal;