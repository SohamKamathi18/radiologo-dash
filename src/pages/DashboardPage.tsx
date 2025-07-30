import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, ScanLine, TrendingUp, Activity, Heart } from 'lucide-react';
import { statisticsAPI, Statistics } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockChartData = [
  { name: 'X-Rays', value: 245, percentage: 45 },
  { name: 'CT Scans', value: 156, percentage: 28 },
  { name: 'MRI', value: 89, percentage: 17 },
  { name: 'Ultrasound', value: 54, percentage: 10 }
];

const mockWeeklyData = [
  { day: 'Mon', scans: 24, reports: 18 },
  { day: 'Tue', scans: 32, reports: 25 },
  { day: 'Wed', scans: 28, reports: 22 },
  { day: 'Thu', scans: 35, reports: 28 },
  { day: 'Fri', scans: 40, reports: 33 },
  { day: 'Sat', scans: 18, reports: 14 },
  { day: 'Sun', scans: 15, reports: 12 }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

export function DashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await statisticsAPI.getEntities();
        setStatistics(data);
      } catch (error) {
        toast({
          title: "Error Loading Statistics",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
        // Use mock data if API fails
        setStatistics({
          total_patients: 1247,
          total_reports: 543,
          total_xrays: 892,
          most_frequent_disease: "Pneumonia",
          recent_activity: 23
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [toast]);

  const statCards = [
    {
      title: "Total Patients",
      value: statistics?.total_patients || 0,
      description: "Registered in system",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Medical Reports",
      value: statistics?.total_reports || 0,
      description: "Processed this month",
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "X-Ray Analyses",
      value: statistics?.total_xrays || 0,
      description: "AI-powered scans",
      icon: ScanLine,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Recent Activity",
      value: statistics?.recent_activity || 0,
      description: "Active cases today",
      icon: Activity,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Medical Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Dashboard</h1>
          <p className="text-muted-foreground">AI-powered radiology insights and analytics</p>
        </div>
        <Badge variant="outline" className="border-success text-success">
          <Heart className="w-3 h-3 mr-1" />
          System Healthy
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border hover:shadow-clinical transition-medical">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Weekly Activity</CardTitle>
            <CardDescription>Scans and reports processed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="scans" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="reports" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Imaging Types Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Imaging Distribution</CardTitle>
            <CardDescription>Types of medical scans processed</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {mockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {mockChartData.map((item, index) => (
                <Badge key={item.name} variant="outline" className="text-xs">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {item.name}: {item.percentage}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {statistics?.most_frequent_disease && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">AI Insights</CardTitle>
            <CardDescription>Key findings from recent analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Most Frequent Condition: <span className="text-warning">{statistics.most_frequent_disease}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on recent AI analysis of medical reports and imaging data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DashboardPage;