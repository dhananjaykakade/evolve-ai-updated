
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const assignmentData = [
  { name: "Assignment 1", score: 85, avg: 78 },
  { name: "Assignment 2", score: 72, avg: 75 },
  { name: "Quiz 1", score: 90, avg: 82 },
  { name: "Assignment 3", score: 88, avg: 80 },
  { name: "Midterm", score: 76, avg: 72 },
  { name: "Assignment 4", score: 92, avg: 83 },
  { name: "Quiz 2", score: 95, avg: 85 },
  { name: "Assignment 5", score: 90, avg: 81 },
  { name: "Final Project", score: 94, avg: 86 },
];

const weeklyActivityData = [
  { name: "Week 1", submissions: 3, participation: 80 },
  { name: "Week 2", submissions: 2, participation: 70 },
  { name: "Week 3", submissions: 4, participation: 90 },
  { name: "Week 4", submissions: 3, participation: 85 },
  { name: "Week 5", submissions: 1, participation: 60 },
  { name: "Week 6", submissions: 3, participation: 75 },
  { name: "Week 7", submissions: 4, participation: 95 },
  { name: "Week 8", submissions: 3, participation: 80 },
];

const skillBreakdownData = [
  { name: "Problem Solving", value: 85 },
  { name: "Code Quality", value: 78 },
  { name: "Theory", value: 92 },
  { name: "Communication", value: 65 },
  { name: "Teamwork", value: 88 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === "participation" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export const PerformanceChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Student Performance</CardTitle>
        <CardDescription>
          Track student progress across different assignments and metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assignments">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Assignment Scores</TabsTrigger>
            <TabsTrigger value="activity">Weekly Activity</TabsTrigger>
            <TabsTrigger value="skills">Skill Breakdown</TabsTrigger>
          </TabsList>
          <TabsContent value="assignments" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assignmentData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    height={40}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Student Score" />
                  <Bar dataKey="avg" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Class Average" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="activity" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyActivityData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 5]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="submissions"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Submissions"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="participation"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Participation"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="skills" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {skillBreakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Score"]}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
