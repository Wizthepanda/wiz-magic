import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { CreatorHeader } from './components/Header';
import { CreatorKpiStrip } from './components/KpiStrip';
import { CreatorOverview } from './components/Overview';
import { CreatorContentGrid } from './components/ContentGrid';
import { CreatorCourseList } from './components/CourseList';
import { CreatorEarningsPanel } from './components/EarningsPanel';
import { CreatorAnalyticsPanel } from './components/AnalyticsPanel';
import { CreatorSettings } from './components/Settings';
import { 
  BarChart3, 
  Video, 
  GraduationCap, 
  DollarSign, 
  TrendingUp,
  Settings as SettingsIcon
} from 'lucide-react';

interface CreatorPrivateProfileProps {
  className?: string;
}

export const CreatorPrivateProfile: React.FC<CreatorPrivateProfileProps> = ({ className }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { totalXP, level, progressPercent } = useXp();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !user.uid) {
    return null;
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100", className)}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/50">
        <CreatorHeader 
          user={user}
          totalXP={totalXP}
          level={level}
          progressPercent={progressPercent}
        />
        
        {/* KPI Strip */}
        <div className="border-t border-slate-200/50">
          <CreatorKpiStrip userId={user.uid} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className={cn(
            "grid w-full mb-6 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1",
            isMobile ? "grid-cols-3" : "grid-cols-6"
          )}>
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {!isMobile && "Overview"}
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Video className="w-4 h-4 mr-2" />
              {!isMobile && "Content"}
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {!isMobile && "Courses"}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger 
                  value="earnings" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Mobile Additional Tabs */}
          {isMobile && (
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1">
              <TabsTrigger 
                value="earnings" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          )}

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <CreatorOverview userId={user.uid} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6 mt-0">
            <CreatorContentGrid userId={user.uid} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6 mt-0">
            <CreatorCourseList userId={user.uid} />
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6 mt-0">
            <CreatorEarningsPanel userId={user.uid} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-0">
            <CreatorAnalyticsPanel userId={user.uid} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-0">
            <CreatorSettings userId={user.uid} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};