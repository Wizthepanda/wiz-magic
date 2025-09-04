import { Card, CardContent } from '@/components/ui/card';
import { useCreatorStats } from '../hooks/useCreatorStats';
import { useXp } from '@/context/XpContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Zap, 
  Users, 
  Eye, 
  DollarSign, 
  GraduationCap,
  Video,
  PlayCircle,
  BookOpen
} from 'lucide-react';

interface KpiStripProps {
  userId: string;
}

interface KpiCard {
  id: string;
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  gradient: string;
  loading?: boolean;
}

export const CreatorKpiStrip: React.FC<KpiStripProps> = ({ userId }) => {
  const isMobile = useIsMobile();
  const { totalXP } = useXp();
  const { data: stats, isLoading } = useCreatorStats(userId);

  const kpiCards: KpiCard[] = [
    {
      id: "xp",
      title: "Total XP",
      value: (totalXP || 0).toLocaleString(),
      subValue: "WIZ Platform",
      icon: Zap,
      gradient: "from-yellow-400 to-orange-500",
      loading: false
    },
    {
      id: "subscribers",
      title: "Subscribers",
      value: stats?.youtubeStats?.subscriberCount || "0",
      subValue: "YouTube",
      icon: Users,
      gradient: "from-red-500 to-pink-600",
      loading: isLoading
    },
    {
      id: "views",
      title: "Lifetime Views",
      value: (stats?.lifetimeViews || 0).toLocaleString(),
      subValue: "WIZ Platform",
      icon: Eye,
      gradient: "from-blue-500 to-purple-600",
      loading: isLoading
    },
    {
      id: "tips",
      title: "Tips Earned",
      value: `$${(stats?.earnings?.tips || 0).toFixed(2)}`,
      subValue: "USD",
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
      loading: isLoading
    },
    {
      id: "course_revenue",
      title: "Course Revenue",
      value: `$${(stats?.earnings?.courses || 0).toFixed(2)}`,
      subValue: "USD",
      icon: GraduationCap,
      gradient: "from-indigo-500 to-blue-600",
      loading: isLoading
    },
    {
      id: "videos",
      title: "Videos",
      value: stats?.content?.videosCount || 0,
      subValue: "Published",
      icon: Video,
      gradient: "from-purple-500 to-pink-500",
      loading: isLoading
    },
    {
      id: "shorts", 
      title: "Shorts",
      value: stats?.content?.shortsCount || 0,
      subValue: "Published",
      icon: PlayCircle,
      gradient: "from-teal-500 to-cyan-600",
      loading: isLoading
    },
    {
      id: "courses",
      title: "Courses",
      value: stats?.content?.coursesCount || 0,
      subValue: "Created",
      icon: BookOpen,
      gradient: "from-amber-500 to-yellow-600",
      loading: isLoading
    }
  ];

  return (
    <div className="container mx-auto px-4 py-4">
      <div className={cn(
        "grid gap-4",
        isMobile 
          ? "grid-cols-2" 
          : "grid-cols-4 lg:grid-cols-8"
      )}>
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          
          return (
            <Card 
              key={kpi.id}
              className="relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-5`} />
              
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  
                  {kpi.loading && (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900">
                    {kpi.loading ? (
                      <div className="w-12 h-6 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      kpi.value
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    {kpi.title}
                  </div>
                  {kpi.subValue && (
                    <div className="text-xs text-slate-500">
                      {kpi.subValue}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};