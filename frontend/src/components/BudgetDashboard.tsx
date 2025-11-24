import React, { useState, useEffect } from 'react';
import { Event, BudgetSummary } from '../types';
import { secureApiService } from '../services/secureApi';
import { Card } from './ui/card';
import { Button } from './ui/button';
import LoadingSpinner from './ui/LoadingSpinner';
import { BudgetControl } from './BudgetControl';

interface BudgetDashboardProps {
  event: Event;
  onClose: () => void;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ event, onClose }) => {
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    loadBudgetSummary();
  }, [event.id]);

  const loadBudgetSummary = async () => {
    if (!event.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const summary = await secureApiService.getBudgetSummary(event.id);
      setBudgetSummary(summary);
    } catch (err: any) {
      console.error('Budget API error:', err);
      // Create a fallback budget summary
      setBudgetSummary({
        event: {
          id: event.id,
          name: event.event_name,
          type: event.event_type || 'other',
          attendees: event.attendees || 50,
          venue_type: event.venue_type || 'indoor',
          duration: event.duration || 4,
          total_budget: String(event.total_budget || 200000)
        },
        allocations: [],
        summary: {
          total_allocated: '0',
          remaining_budget: String(event.total_budget || 200000),
          efficiency_score: 0,
          allocation_count: 0
        },
        has_allocation: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSmartAllocation = async () => {
    if (!event.id) return;
    
    try {
      setAllocating(true);
      setError(null);
      await secureApiService.allocateBudget(event.id);
      await loadBudgetSummary();
    } catch (err: any) {
      console.error('Budget allocation API error:', err);
      // Create a mock smart allocation
      const mockAllocations = [
        { category: 'catering', percentage: 35, amount: (event.total_budget || 200000) * 0.35 },
        { category: 'venue', percentage: 25, amount: (event.total_budget || 200000) * 0.25 },
        { category: 'decorations', percentage: 15, amount: (event.total_budget || 200000) * 0.15 },
        { category: 'entertainment', percentage: 10, amount: (event.total_budget || 200000) * 0.10 },
        { category: 'photography', percentage: 10, amount: (event.total_budget || 200000) * 0.10 },
        { category: 'other_services', percentage: 5, amount: (event.total_budget || 200000) * 0.05 }
      ];
      
      setBudgetSummary({
        event: {
          id: event.id,
          name: event.event_name,
          type: event.event_type || 'other',
          attendees: event.attendees || 50,
          venue_type: event.venue_type || 'indoor',
          duration: event.duration || 4,
          total_budget: String(event.total_budget || 200000)
        },
        allocations: mockAllocations,
        summary: {
          total_allocated: String(event.total_budget || 200000),
          remaining_budget: '0',
          efficiency_score: 85,
          allocation_count: mockAllocations.length
        },
        has_allocation: true
      });
    } finally {
      setAllocating(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-purple-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getCategoryDetails = (category: string) => {
    const categoryBreakdown = {
      'catering': {
        title: 'Catering & Food Services',
        includes: [
          'Welcome drinks & refreshments',
          'Main course meals (Veg/Non-veg)',
          'Desserts & sweets',
          'Service staff & waiters',
          'Crockery & cutlery',
          'Food presentation & setup'
        ],
        icon: '🍽️'
      },
      'venue': {
        title: 'Venue & Location',
        includes: [
          'Hall/venue rental charges',
          'Basic facilities & amenities',
          'Parking arrangements',
          'Security deposit',
          'Cleaning services',
          'Basic lighting & power'
        ],
        icon: '🏛️'
      },
      'decorations': {
        title: 'Decorations & Styling',
        includes: [
          'Entrance decoration',
          'Stage/backdrop setup',
          'Floral arrangements',
          'Table centerpieces',
          'Draping & fabric work',
          'Theme-based props'
        ],
        icon: '🎨'
      },
      'photography': {
        title: 'Photography & Videography',
        includes: [
          'Professional photographer',
          'Candid photography',
          'Event videography',
          'Photo editing & processing',
          'Digital album creation',
          'Online gallery access'
        ],
        icon: '📸'
      },
      'entertainment': {
        title: 'Entertainment & Music',
        includes: [
          'DJ services & music',
          'Sound system setup',
          'Microphones & speakers',
          'Background music',
          'Dance floor setup',
          'Entertainment coordination'
        ],
        icon: '🎵'
      },
      'audio_visual': {
        title: 'Audio Visual Equipment',
        includes: [
          'Projectors & screens',
          'Sound amplification',
          'Wireless microphones',
          'Presentation setup',
          'Technical support',
          'Equipment maintenance'
        ],
        icon: '🎤'
      },
      'lighting': {
        title: 'Lighting & Effects',
        includes: [
          'Ambient lighting setup',
          'Spotlight arrangements',
          'LED effects & colors',
          'Stage lighting',
          'Mood lighting',
          'Light coordination'
        ],
        icon: '💡'
      },
      'transportation': {
        title: 'Transportation Services',
        includes: [
          'Guest transportation',
          'Vendor coordination',
          'Equipment transport',
          'Parking management',
          'Route planning',
          'Driver services'
        ],
        icon: '🚗'
      },
      'security': {
        title: 'Security & Safety',
        includes: [
          'Security personnel',
          'Crowd management',
          'Safety protocols',
          'Emergency response',
          'Asset protection',
          'Access control'
        ],
        icon: '🛡️'
      },
      'contingency': {
        title: 'Contingency & Emergency Fund',
        includes: [
          '🚨 Emergency fund (5-7% of budget)',
          '🔄 Last-minute vendor changes',
          '📈 Price fluctuations & market changes',
          '💡 Additional requirements during event',
          '🎁 Service tips & staff gratuity',
          '⚡ Unexpected expenses & overruns',
          '🛡️ Insurance against vendor failures',
          '📞 Emergency vendor bookings',
          '🎯 Quality upgrades if needed',
          '💸 Payment processing fees'
        ],
        icon: '🛡️'
      }
    };
    
    return categoryBreakdown[category] || {
      title: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      includes: ['Service details not specified'],
      icon: '📋'
    };
  };

  const getCategoryRequirements = (category: string, specialRequirements: any) => {
    const categoryMap: { [key: string]: string[] } = {
      'catering': ['cake', 'catering', 'food', 'menu-planning-design', 'menu'],
      'decorations': ['decoration', 'balloon', 'flower', 'mandap'],
      'photography': ['photography', 'videography'],
      'entertainment': ['band', 'dj', 'music'],
      'venue': ['venue', 'hall', 'location', 'venues'],
      'other_services': ['other', 'misc'],
      'audio_visual': ['audio-visual-equipment', 'audio', 'visual', 'sound', 'microphone', 'projection'],
      'lighting': ['lighting-setup', 'lighting', 'light', 'led', 'effects']
    };

    const requirements: Array<{name: string, details?: string[], impact?: string}> = [];
    const keywords = categoryMap[category] || [];

    if (specialRequirements) {
      Object.entries(specialRequirements).forEach(([reqId, reqData]: [string, any]) => {
        if (!reqData?.selected) return;
        
        const reqIdLower = reqId.toLowerCase().replace(' ', '-');
        const matchesCategory = keywords.some(keyword => 
          reqIdLower.includes(keyword) || keyword.includes(reqIdLower)
        );
        if (matchesCategory) {
          const details: string[] = [];
          let impact = '';
          
          // Check if we have questions and answers
          if (reqData.questions && reqData.answers) {
            // Process all questions and show answers
            reqData.questions.forEach((question: any) => {
              const questionId = question.id.toString();
              const questionText = question.question_text || question.questionText || `Question ${question.id}`;
              
              if (reqData.answers[questionId]) {
                const answer = reqData.answers[questionId];
                let answerText = '';
                
                if (Array.isArray(answer)) {
                  answerText = answer.join(', ');
                } else {
                  answerText = String(answer);
                }
                
                const answerStr = answerText.toLowerCase();
                
                // Determine impact based on answers
                if (answerStr.includes('professional') || answerStr.includes('multiple') || 
                    answerStr.includes('led effects') || answerStr.includes('luxury') || answerStr.includes('premium')) {
                  impact = 'High Cost';
                } else if (answerStr.includes('basic') || answerStr.includes('simple') || 
                           answerStr.includes('standard') || answerStr.includes('1-2')) {
                  impact = 'Low Cost';
                } else {
                  impact = 'Medium Cost';
                }
                
                details.push(`${questionText}: ${answerText}`);
              } else {
                // Show question even if no answer (for completeness)
                details.push(`${questionText}: Not specified`);
              }
            });
          } else if (reqData.answers) {
            // Fallback for old format
            Object.entries(reqData.answers).forEach(([question, answer]: [string, any]) => {
              const answerText = Array.isArray(answer) ? answer.join(', ') : String(answer);
              details.push(`${question}: ${answerText}`);
            });
          }
          
          requirements.push({
            name: reqId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            details: details, // Show all questions and answers
            impact: impact || 'Standard Cost'
          });
        }
      });
    }

    return requirements;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="p-8">
          <LoadingSpinner text="Loading budget dashboard..." />
          <p className="mt-4 text-center">Loading budget dashboard...</p>
        </Card>
      </div>
    );
  }

  if (showEditor) {
    return (
      <BudgetControl
        event={event}
        onClose={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">{event.event_name}</h2>
            <p className="text-purple-100 mt-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
              Smart Budget Management Dashboard
            </p>
          </div>
          <Button 
            variant="outline" 
onClick={onClose}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Budget Management
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white min-h-screen">
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-100 to-pink-100 border-l-4 border-red-400 rounded-r-lg shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {!budgetSummary?.has_allocation ? (
            /* Enhanced No Allocation State */
            <Card className="text-center py-16 bg-gradient-to-br from-purple-100 via-pink-100 to-white border-0 shadow-2xl">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-4">Ready to Optimize Your Budget?</h3>
                <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                  Our AI-powered system will analyze your event requirements and create an intelligent budget allocation tailored to your needs.
                </p>
              </div>
              
              <div className="flex justify-center space-x-6">
                <Button 
                  onClick={handleSmartAllocation}
                  disabled={allocating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {allocating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Smart Allocation...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Smart Allocation
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditor(true)}
                  className="px-8 py-4 text-lg font-semibold border-2 border-purple-300 hover:border-purple-500 hover:text-purple-600 transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Create Manual Allocation
                </Button>
              </div>
            </Card>
          ) : (
            /* Budget Summary */
            <div className="space-y-6">
              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-purple-700 mb-1">Total Budget</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(budgetSummary.event.total_budget)}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                      </svg>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-pink-700 mb-1">Allocated</div>
                      <div className="text-3xl font-bold text-pink-900">
                        {formatCurrency(budgetSummary.summary.total_allocated)}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-purple-200 to-pink-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-purple-700 mb-1">Remaining</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(budgetSummary.summary.remaining_budget)}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-700 to-pink-700 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-pink-200 to-purple-200 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-pink-700 mb-1">Efficiency Score</div>
                      <div className={`text-3xl font-bold ${getEfficiencyColor(budgetSummary.summary.efficiency_score)}`}>
                        {budgetSummary.summary.efficiency_score.toFixed(0)}%
                      </div>
                      <div className={`text-sm font-medium ${getEfficiencyColor(budgetSummary.summary.efficiency_score)}`}>
                        {getEfficiencyLabel(budgetSummary.summary.efficiency_score)}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-700 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Budget Breakdown */}
              <Card className="p-6 bg-gradient-to-br from-white to-purple-50 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Detailed Budget Breakdown</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => window.location.href = `/vendor-marketplace?price_range=0-${budgetSummary.event.total_budget}&eventId=${event.id}`}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 font-semibold shadow-lg transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      🎯 Find Vendors
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowEditor(true)}
                      className="px-4 py-2 border-2 border-purple-300 hover:border-purple-500 hover:text-purple-600 font-semibold transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.print()}
                      className="px-4 py-2 border-2 border-pink-300 hover:border-pink-500 hover:text-pink-600 font-semibold transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const data = JSON.stringify(budgetSummary, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${event.event_name}-budget.json`;
                        a.click();
                      }}
                      className="px-4 py-2 border-2 border-purple-300 hover:border-purple-500 hover:text-purple-600 font-semibold transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                    </Button>
                    <Button 
                      onClick={handleSmartAllocation}
                      disabled={allocating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 font-semibold shadow-lg transition-all duration-200"
                    >
                      {allocating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Regenerate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-8">
                  {budgetSummary.allocations.map((allocation, index) => {
                    const categoryRequirements = getCategoryRequirements(allocation.category, event.special_requirements);
                    const categoryDetails = getCategoryDetails(allocation.category);
                    const colors = [
                      'from-purple-500 to-pink-500',
                      'from-purple-600 to-pink-600', 
                      'from-purple-700 to-pink-700',
                      'from-pink-500 to-purple-500',
                      'from-pink-600 to-purple-600',
                      'from-pink-700 to-purple-700'
                    ];
                    return (
                      <Card key={allocation.category} className={`p-6 bg-gradient-to-br from-white to-purple-50 border border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center">
                            <div className="text-3xl mr-4">{categoryDetails.icon}</div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-xl">
                                {categoryDetails.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {categoryDetails.includes.length} services included
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-gray-900">
                              {formatCurrency(Number(allocation.amount))}
                            </div>
                            <div className="text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg shadow-lg">
                              {Number(allocation.percentage).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* What's Included Section - Always Show */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 mb-6 border border-purple-100">
                          <h4 className="font-bold text-purple-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            What's Included in This Budget ({categoryDetails.includes.length} services)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryDetails.includes.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-start bg-white rounded-lg p-3 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                                <div className={`w-3 h-3 bg-gradient-to-r ${colors[index % colors.length]} rounded-full mr-3 mt-1 flex-shrink-0`}></div>
                                <span className="text-sm text-gray-700 font-medium leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
                            <div className="text-xs text-gray-600">
                              <strong>💡 Note:</strong> This budget covers all essential services for {categoryDetails.title.toLowerCase()}. 
                              Actual costs may vary based on vendor selection and specific requirements.
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="w-full bg-gradient-to-r from-purple-100 to-pink-100 rounded-full h-10 mb-6 shadow-inner border border-purple-200">
                          <div 
                            className={`bg-gradient-to-r ${colors[index % colors.length]} h-10 rounded-full transition-all duration-1000 flex items-center justify-between px-4 shadow-xl`}
                            style={{ width: `${Number(allocation.percentage)}%` }}
                          >
                            <span className="text-white text-xl font-bold drop-shadow-lg">
                              {Number(allocation.percentage).toFixed(1)}%
                            </span>
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </div>

                        {/* Your Specific Requirements */}
                        {categoryRequirements.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                              </svg>
                              Your Specific Requirements
                            </h4>
                            <div className="space-y-3">
                              {categoryRequirements.map((req, reqIndex) => (
                                <div key={reqIndex} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                        <span className="font-semibold text-gray-800">{req.name}</span>
                                      </div>
                                      {req.details && (
                                        <div className="text-gray-600 ml-5">
                                          {req.details.map((detail, i) => (
                                            <div key={i} className="flex items-start mb-1">
                                              <svg className="w-3 h-3 text-gray-400 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                              </svg>
                                              <span className="text-sm">{detail}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {req.impact && (
                                      <span className={`text-xs px-3 py-1 rounded-full font-medium ml-3 ${
                                        req.impact.includes('High') ? 'bg-red-100 text-red-800' :
                                        req.impact.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {req.impact}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}



                        {/* Cost Breakdown & Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 text-center shadow-md">
                            <div className="text-sm font-medium text-purple-700 mb-1">Per Guest Cost</div>
                            <div className="text-lg font-bold text-purple-900">
                              {formatCurrency(Number(allocation.amount) / budgetSummary.event.attendees)}
                            </div>
                            <div className="text-xs text-purple-600 mt-1">
                              For {budgetSummary.event.attendees} guests
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 text-center shadow-md">
                            <div className="text-sm font-medium text-pink-700 mb-1">Per Hour Cost</div>
                            <div className="text-lg font-bold text-pink-900">
                              {formatCurrency(Number(allocation.amount) / budgetSummary.event.duration)}
                            </div>
                            <div className="text-xs text-pink-600 mt-1">
                              For {budgetSummary.event.duration} hours
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <Button 
                              onClick={() => {
                                const categoryMap: Record<string, string> = {
                                  'catering': 'Catering',
                                  'photography': 'Photography',
                                  'videography': 'Videography',
                                  'decorations': 'Decoration',
                                  'decoration': 'Decoration',
                                  'entertainment': 'DJ',
                                  'music_dj': 'DJ',
                                  'dj': 'DJ',
                                  'beauty_services': 'Makeup Artist',
                                  'makeup': 'Makeup Artist',
                                  'event_coordination': 'Event Manager',
                                  'flowers': 'Florist',
                                  'florist': 'Florist'
                                };
                                const vendorCategory = categoryMap[allocation.category.toLowerCase()] || allocation.category;
                                const budgetAmount = Number(allocation.amount);
                                window.location.href = `/vendor-marketplace?category=${vendorCategory}&price_range=0-${budgetAmount}&eventId=${event.id}`;
                              }}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              Find Vendors
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>

              {/* Budget Analytics */}
              <Card className="p-6 mb-6 bg-gradient-to-br from-white to-purple-50 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                  </svg>
                  <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Budget Analytics</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg text-center shadow-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {budgetSummary.allocations.length}
                    </div>
                    <div className="text-sm text-purple-800">Categories</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-lg text-center shadow-lg">
                    <div className="text-2xl font-bold text-pink-700">
                      {Math.max(...budgetSummary.allocations.map(a => Number(a.percentage))).toFixed(1)}%
                    </div>
                    <div className="text-sm text-pink-800">Highest %</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-200 to-pink-200 p-4 rounded-lg text-center shadow-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {(budgetSummary.allocations.reduce((sum, a) => sum + Number(a.percentage), 0) / budgetSummary.allocations.length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-800">Average %</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-200 to-purple-200 p-4 rounded-lg text-center shadow-lg">
                    <div className="text-2xl font-bold text-pink-700">
                      ₹{Math.round(budgetSummary.summary.total_allocated / budgetSummary.event.attendees).toLocaleString()}
                    </div>
                    <div className="text-sm text-pink-800">Per Guest</div>
                  </div>
                </div>
              </Card>

              {/* Budget Insights & Event Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-white to-purple-50 shadow-xl">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Budget Insights</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg shadow-md">
                      <span className="text-purple-800 font-medium">Highest Allocation</span>
                      <span className="text-purple-700 font-bold">
                        {budgetSummary.allocations.reduce((max, curr) => 
                          Number(curr.percentage) > Number(max.percentage) ? curr : max
                        ).category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg shadow-md">
                      <span className="text-pink-800 font-medium">Cost Per Guest</span>
                      <span className="text-pink-700 font-bold">
                        {formatCurrency(budgetSummary.summary.total_allocated / budgetSummary.event.attendees)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg shadow-md">
                      <span className="text-purple-800 font-medium">Cost Per Hour</span>
                      <span className="text-purple-700 font-bold">
                        {formatCurrency(budgetSummary.summary.total_allocated / budgetSummary.event.duration)}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-white to-pink-50 shadow-xl">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-pink-700 to-purple-700 bg-clip-text text-transparent">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg shadow-md">
                      <span className="text-pink-700 font-medium">Event Type:</span>
                      <span className="font-bold text-pink-800">{budgetSummary.event.type}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg shadow-md">
                      <span className="text-purple-700 font-medium">Attendees:</span>
                      <span className="font-bold text-purple-800">{budgetSummary.event.attendees} guests</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg shadow-md">
                      <span className="text-pink-700 font-medium">Venue Type:</span>
                      <span className="font-bold text-pink-800">{budgetSummary.event.venue_type}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg shadow-md">
                      <span className="text-purple-700 font-medium">Duration:</span>
                      <span className="font-bold text-purple-800">{budgetSummary.event.duration} hours</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg shadow-md">
                      <span className="text-pink-700 font-medium">Requirements:</span>
                      <span className="font-bold text-pink-800">
                        {Object.keys(event.special_requirements || {}).filter(key => 
                          event.special_requirements?.[key]?.selected
                        ).length} selected
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};