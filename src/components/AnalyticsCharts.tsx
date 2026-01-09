import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePersonnel } from '@/contexts/PersonnelContext';

const CATEGORY_COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 70%, 45%)', 'hsl(38, 92%, 50%)'];
const RANK_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(217, 91%, 50%)',
  'hsl(217, 91%, 40%)',
  'hsl(217, 91%, 30%)',
  'hsl(142, 70%, 45%)',
  'hsl(142, 70%, 35%)',
  'hsl(38, 92%, 50%)',
  'hsl(38, 92%, 40%)',
  'hsl(0, 62%, 45%)',
];

export function CategoryBreakdownChart() {
  const { stats } = usePersonnel();

  const data = [
    { name: 'Police Officers', value: stats.policeOfficers, color: CATEGORY_COLORS[0] },
    { name: 'Civilian Staff', value: stats.civilians, color: CATEGORY_COLORS[1] },
    { name: 'Student Attachees', value: stats.activeStudents, color: CATEGORY_COLORS[2] },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No personnel data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(222, 47%, 9%)', 
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '8px',
            color: 'hsl(210, 40%, 96%)'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RankBreakdownChart() {
  const { stats } = usePersonnel();

  const data = Object.entries(stats.rankBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([rank, count], index) => ({
      rank,
      count,
      fill: RANK_COLORS[index % RANK_COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No police officers registered
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="rank" width={100} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 9%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '8px',
            color: 'hsl(210, 40%, 96%)'
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
