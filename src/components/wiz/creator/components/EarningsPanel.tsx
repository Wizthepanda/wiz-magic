import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useCreatorStats } from '../hooks/useCreatorStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Heart,
  Users,
  Calendar,
  Download,
  Wallet
} from 'lucide-react';

interface EarningsPanelProps {
  userId: string;
}

export const CreatorEarningsPanel: React.FC<EarningsPanelProps> = ({ userId }) => {
  const { data: stats, isLoading } = useCreatorStats(userId);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const earningsData = [
    {
      title: "Tips & Donations",
      amount: stats?.earnings.tips || 0,
      icon: Heart,
      gradient: "from-red-500 to-pink-600",
      description: "Direct support from viewers"
    },
    {
      title: "Course Sales",
      amount: stats?.earnings.courses || 0,
      icon: GraduationCap,
      gradient: "from-indigo-500 to-purple-600",
      description: "Revenue from course enrollments"
    },
    {
      title: "Sponsorships",
      amount: stats?.earnings.sponsorships || 0,
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      description: "Brand partnerships and deals"
    }
  ];

  const monthlyBreakdown = [
    { month: 'January', tips: 245.50, courses: 1850.00, sponsorships: 500.00 },
    { month: 'February', tips: 189.25, courses: 2100.00, sponsorships: 750.00 },
    { month: 'March', tips: 312.75, courses: 1750.00, sponsorships: 500.00 },
    { month: 'April', tips: 156.00, courses: 2300.00, sponsorships: 1000.00 },
    { month: 'May', tips: 278.50, courses: 1950.00, sponsorships: 500.00 },
    { month: 'June', tips: 194.75, courses: 2450.00, sponsorships: 750.00 }
  ];

  const totalEarnings = stats?.earnings.total || 0;
  const thisMonth = stats?.earnings.thisMonth || 0;
  const lastMonth = stats?.earnings.lastMonth || 0;
  const growth = thisMonth > 0 && lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Large Central Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-2xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-500 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <CardContent className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-slate-700 mb-2">Lifetime Earnings</h2>
                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${totalEarnings.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-slate-600">This Month</span>
                  <span className="text-lg font-semibold text-green-700">${thisMonth.toLocaleString()}</span>
                  {growth !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(growth).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Mini Bar Chart */}
              <div className="flex items-end gap-1 h-24">
                {monthlyBreakdown.slice(-6).map((month, i) => {
                  const total = month.tips + month.courses + month.sponsorships;
                  const maxTotal = Math.max(...monthlyBreakdown.map(m => m.tips + m.courses + m.sponsorships));
                  const heightPercent = (total / maxTotal) * 100;

                  return (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center gap-1"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      style={{ transformOrigin: 'bottom' }}
                    >
                      <div
                        className="w-8 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-md"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-slate-600">{month.month.slice(0, 3)}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Payout Status & Sync Button */}
            <div className="flex items-center justify-between pt-6 border-t border-green-200">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4" />
                <span>Next Payout: <span className="font-semibold">Oct 30</span></span>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                <Wallet className="w-4 h-4 mr-2" />
                Sync to Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Split Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-3"
      )}>
        {earningsData.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Card className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5`} />

                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-slate-900">
                      ${item.amount.toLocaleString()}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.description}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${item.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.amount / totalEarnings) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of component remains the same */}
      <div className="hidden">
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">
                ${thisMonth.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-600">
                This Month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Month */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">
                ${lastMonth.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-600">
                Last Month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Report */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <CardContent className="p-6 flex items-center justify-center text-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg mx-auto mb-2">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm font-medium text-slate-900">Download</div>
              <div className="text-xs text-slate-600">Earnings Report</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-3"
          )}>
            {earningsData.map((item, index) => {
              const IconComponent = item.icon;
              
              return (
                <div key={index} className="relative overflow-hidden rounded-lg p-4 border border-slate-200/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5`} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      ${item.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Earnings Chart */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Monthly Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyBreakdown.map((month, index) => {
              const total = month.tips + month.courses + month.sponsorships;
              const maxTotal = Math.max(...monthlyBreakdown.map(m => m.tips + m.courses + m.sponsorships));
              const percentage = (total / maxTotal) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-900">{month.month}</span>
                    <span className="text-sm font-bold text-slate-900">${total.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="flex h-full">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-pink-600"
                        style={{ width: `${(month.tips / total) * percentage}%` }}
                      />
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600"
                        style={{ width: `${(month.courses / total) * percentage}%` }}
                      />
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-600"
                        style={{ width: `${(month.sponsorships / total) * percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Tips: ${month.tips}</span>
                    <span>Courses: ${month.courses}</span>
                    <span>Sponsors: ${month.sponsorships}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Next Payout</h4>
              <p className="text-2xl font-bold text-green-600">${thisMonth.toFixed(2)}</p>
              <p className="text-sm text-slate-600">Expected on 1st of next month</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Payment Method</h4>
              <p className="text-slate-900">Bank Transfer</p>
              <p className="text-sm text-slate-600">**** **** **** 1234</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};