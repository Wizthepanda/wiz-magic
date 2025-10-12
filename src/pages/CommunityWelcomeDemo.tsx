import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommunityWelcomeModal } from '@/components/wiz/community/CommunityWelcomeModal';
import { Users, BookOpen, MessageCircle } from 'lucide-react';

/**
 * Demo page for testing the Community Welcome Modal
 * Shows different join scenarios
 */
const CommunityWelcomeDemo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);

  // Demo scenarios
  const scenarios = [
    {
      id: 'free-community',
      label: 'Free Community',
      community: {
        id: '1',
        name: 'Creative Wizards Hub',
        coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
        creator: {
          name: 'FacelessAvatars',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faceless'
        },
        category: 'community' as const,
        joinType: 'free' as const
      }
    },
    {
      id: 'free-zaps-community',
      label: 'Free + ZAPs Reward',
      community: {
        id: '2',
        name: 'Tech Innovators',
        coverImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400',
        creator: {
          name: 'TechGuru',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techguru'
        },
        category: 'community' as const,
        joinType: 'free-zaps' as const,
        zapAmount: 50
      }
    },
    {
      id: 'paid-course',
      label: 'Paid Course ($29)',
      community: {
        id: '3',
        name: 'Advanced React Mastery',
        coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
        creator: {
          name: 'CodeMaster',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=codemaster'
        },
        category: 'course' as const,
        joinType: 'paid' as const,
        priceAmount: 29
      }
    },
    {
      id: 'zaps-coaching',
      label: 'ZAPs Coaching',
      community: {
        id: '4',
        name: '1-on-1 Coaching Sessions',
        coverImage: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400',
        creator: {
          name: 'LifeCoach',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lifecoach'
        },
        category: 'coaching' as const,
        joinType: 'paid-zaps' as const,
        zapAmount: 500
      }
    },
    {
      id: 'hybrid-course',
      label: 'Hybrid (ZAPs + USD)',
      community: {
        id: '5',
        name: 'Premium Design Bootcamp',
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        creator: {
          name: 'DesignPro',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designpro'
        },
        category: 'course' as const,
        joinType: 'zaps-usd' as const,
        zapAmount: 200,
        priceAmount: 49
      }
    }
  ];

  const handleOpenScenario = (scenario: any) => {
    setSelectedScenario(scenario);
    setModalOpen(true);
  };

  const handleEnterCommunity = () => {
    console.log('Entering community:', selectedScenario.community.name);
    alert(`Redirecting to ${selectedScenario.community.name}...`);
  };

  const handleExploreCommunities = () => {
    console.log('Exploring more communities');
    alert('Navigating to community explore page...');
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Welcome Modal Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Click any scenario below to preview the welcome modal experience
          </p>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => {
            const getCategoryIcon = () => {
              switch (scenario.community.category) {
                case 'community':
                  return <Users className="w-5 h-5" />;
                case 'course':
                  return <BookOpen className="w-5 h-5" />;
                case 'coaching':
                  return <MessageCircle className="w-5 h-5" />;
              }
            };

            const getCategoryColor = () => {
              switch (scenario.community.category) {
                case 'community':
                  return 'from-indigo-500 to-blue-500';
                case 'course':
                  return 'from-purple-500 to-pink-500';
                case 'coaching':
                  return 'from-green-500 to-emerald-500';
              }
            };

            return (
              <Card
                key={scenario.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleOpenScenario(scenario)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center text-white`}>
                      {getCategoryIcon()}
                    </div>
                    {scenario.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {scenario.community.name}</p>
                    <p><strong>Creator:</strong> {scenario.community.creator.name}</p>
                    <p className="capitalize"><strong>Type:</strong> {scenario.community.category}</p>
                    <p className="capitalize"><strong>Join:</strong> {scenario.community.joinType.replace(/-/g, ' ')}</p>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    Preview Modal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal */}
        {selectedScenario && (
          <CommunityWelcomeModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            community={selectedScenario.community}
            onEnterCommunity={handleEnterCommunity}
            onExploreCommunities={handleExploreCommunities}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityWelcomeDemo;
