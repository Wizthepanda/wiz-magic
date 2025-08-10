import { useState, useEffect } from 'react';
import { Crown, Trophy, Medal, Zap, TrendingUp, Users } from 'lucide-react';
import { FirestoreService } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const topCreators = [
  {
    id: 1,
    name: 'AIGuru42',
    avatar: '',
    xp: 125000,
    level: 15,
    title: 'XP Sorcerer',
    videos: 47,
    followers: '12.5K',
    category: 'AI'
  },
  {
    id: 2,
    name: 'CodeMaster',
    avatar: '',
    xp: 98500,
    level: 12,
    title: 'Content Guru',
    videos: 38,
    followers: '9.8K',
    category: 'Tech'
  },
  {
    id: 3,
    name: 'MoneyWizard',
    avatar: '',
    xp: 87200,
    level: 11,
    title: 'Wealth Sage',
    videos: 32,
    followers: '8.7K',
    category: 'Finance'
  },
  {
    id: 4,
    name: 'BeatCreator',
    avatar: '',
    xp: 76800,
    level: 10,
    title: 'Audio Master',
    videos: 29,
    followers: '7.2K',
    category: 'Music'
  },
  {
    id: 5,
    name: 'HealthHero',
    avatar: '',
    xp: 65400,
    level: 9,
    title: 'Wellness Wizard',
    videos: 25,
    followers: '6.1K',
    category: 'Health'
  }
];

const topWizards = [
  {
    id: 1,
    name: 'WizMaster101',
    avatar: '',
    xp: 45000,
    level: 8,
    title: 'Devoted Learner',
    watchTime: '245h',
    streak: 89
  },
  {
    id: 2,
    name: 'KnowledgeSeeker',
    avatar: '',
    xp: 38900,
    level: 7,
    title: 'Study Champion',
    watchTime: '198h',
    streak: 76
  },
  {
    id: 3,
    name: 'CuriosityQueen',
    avatar: '',
    xp: 34200,
    level: 6,
    title: 'Learning Enthusiast',
    watchTime: '167h',
    streak: 64
  },
  {
    id: 4,
    name: 'BrainBooster',
    avatar: '',
    xp: 29800,
    level: 6,
    title: 'Knowledge Hunter',
    watchTime: '145h',
    streak: 52
  },
  {
    id: 5,
    name: 'SmartStudent',
    avatar: '',
    xp: 26500,
    level: 5,
    title: 'Rising Star',
    watchTime: '134h',
    streak: 43
  }
];

export const WizLeaderboard = () => {
  const [activeTab, setActiveTab] = useState('creators');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await FirestoreService.getLeaderboard(50);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'from-muted/20 to-muted/10 border-border/50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-card-border">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-wiz-primary" />
            <div className="text-2xl font-bold text-foreground">2,450</div>
            <div className="text-sm text-muted-foreground">Active Wizards</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-card-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-wiz-secondary" />
            <div className="text-2xl font-bold text-foreground">1.2M</div>
            <div className="text-sm text-muted-foreground">Total XP Today</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-card-border">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-wiz-accent" />
            <div className="text-2xl font-bold text-foreground">156</div>
            <div className="text-sm text-muted-foreground">Featured Creators</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30">
          <TabsTrigger value="creators" className="data-[state=active]:bg-wiz-primary data-[state=active]:text-white">
            Top Creators
          </TabsTrigger>
          <TabsTrigger value="wizards" className="data-[state=active]:bg-wiz-secondary data-[state=active]:text-white">
            Top Wizards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="space-y-4">
          {topCreators.map((creator, index) => {
            const rank = index + 1;
            return (
              <Card 
                key={creator.id} 
                className={`glass-card border bg-gradient-to-r ${getRankColor(rank)} hover:scale-[1.02] transition-transform duration-200`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/50">
                      {getRankIcon(rank)}
                      <span className="absolute text-xs font-bold mt-8">{rank}</span>
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="w-12 h-12 border-2 border-wiz-primary/30">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold">
                        {creator.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold truncate">{creator.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Lv{creator.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {creator.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{creator.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{creator.videos} videos</span>
                        <span>{creator.followers} followers</span>
                      </div>
                    </div>
                    
                    {/* XP */}
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Zap className="w-4 h-4 text-wiz-accent" />
                        <span className="font-bold text-lg">{creator.xp.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    
                    {/* Action */}
                    <Button size="sm" variant="outline" className="hover:bg-wiz-primary/10">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="wizards" className="space-y-4">
          {topWizards.map((wizard, index) => {
            const rank = index + 1;
            return (
              <Card 
                key={wizard.id} 
                className={`glass-card border bg-gradient-to-r ${getRankColor(rank)} hover:scale-[1.02] transition-transform duration-200`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/50">
                      {getRankIcon(rank)}
                      <span className="absolute text-xs font-bold mt-8">{rank}</span>
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="w-12 h-12 border-2 border-wiz-secondary/30">
                      <AvatarImage src={wizard.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-wiz-secondary to-wiz-magic text-white font-bold">
                        {wizard.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold truncate">{wizard.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Lv{wizard.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{wizard.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{wizard.watchTime} watched</span>
                        <span>{wizard.streak} day streak</span>
                      </div>
                    </div>
                    
                    {/* XP */}
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Zap className="w-4 h-4 text-wiz-accent" />
                        <span className="font-bold text-lg">{wizard.xp.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    
                    {/* Action */}
                    <Button size="sm" variant="outline" className="hover:bg-wiz-secondary/10">
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};