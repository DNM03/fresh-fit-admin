import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function DashboardPage() {
  const exercises = [
    {
      planName: "Legs Extreme",
      duration: "1 month",
      type: "Advanced",
      chosenBy: 100,
    },
    {
      planName: "Cardio Blast",
      duration: "2 weeks",
      type: "Intermediate",
      chosenBy: 150,
    },
    {
      planName: "Full Body Workout",
      duration: "3 months",
      type: "Beginner",
      chosenBy: 200,
    },
    {
      planName: "Strength Training",
      duration: "6 weeks",
      type: "Advanced",
      chosenBy: 120,
    },
    {
      planName: "Yoga Flex",
      duration: "1 month",
      type: "Beginner",
      chosenBy: 180,
    },
  ];
  const meals = [
    {
      planName: "Keto Diet",
      type: "Breakfast",
      calories: 500,
      chosenBy: 90,
    },
    {
      planName: "Vegan Cleanse",
      type: "Lunch",
      calories: 400,
      chosenBy: 110,
    },
    {
      planName: "Paleo Plan",
      type: "Dinner",
      calories: 600,
      chosenBy: 130,
    },
    {
      planName: "Mediterranean Diet",
      type: "Breakfast",
      calories: 450,
      chosenBy: 95,
    },
    {
      planName: "Low Carb Diet",
      type: "Lunch",
      calories: 350,
      chosenBy: 120,
    },
  ];

  const challenges = [
    {
      title: "30 Day Plank Challenge",
      description: "Hold a plank for 30 days",
      duration: "30 days",
      participants: 100,
      thumbnail: "https://placehold.co/64x40",
    },
    {
      title: "100 Pushups Challenge",
      description: "Do 100 pushups in a day",
      duration: "1 day",
      participants: 50,
      thumbnail: "https://placehold.co/64x40",
    },
    {
      title: "30 Day Squat Challenge",
      description: "Do squats for 30 days",
      duration: "30 days",
      participants: 80,
      thumbnail: "https://placehold.co/64x40",
    },
  ];

  const users = [
    {
      avatar: "https://placehold.co/40",
      name: "John Doe",
      posts: 10,
      point: 1000,
    },
    {
      avatar: "https://placehold.co/40",
      name: "Jane Smith",
      posts: 15,
      point: 1500,
    },
    {
      avatar: "https://placehold.co/40",
      name: "Alice Johnson",
      posts: 8,
      point: 800,
    },
  ];

  const COLORS = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Sage Green
    "#FFEEAD", // Cream Yellow
  ];

  const totalParticipants = exercises.reduce((sum, ex) => sum + ex.chosenBy, 0);

  const CustomExerciseTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded shadow-lg border">
          <p className="font-bold">{data.planName}</p>
          <p>Participants: {data.chosenBy}</p>
          <p>Duration: {data.duration}</p>
          <p>Type: {data.type}</p>
          <p>
            Share: {((data.chosenBy / totalParticipants) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };
  const CustomMealTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border">
          <p className="font-bold">{label}</p>
          <p className="text-[#ecaa74]">Calories: {payload[0].value}</p>
          <p className="text-blue-500">Participants: {payload[1].value}</p>
          <p className="text-gray-600">
            Meal Type: {meals.find((m) => m.planName === label)?.type}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex flex-row w-full p-4 gap-x-4 h-1/2">
        <div className="w-full border rounded-md shadow p-4 flex flex-col">
          <p className="font-semibold text-2xl">Top 5 Exercise Plans</p>
          <div className="h-full">
            <PieChart width={520} height={300}>
              <Pie
                data={exercises}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="chosenBy"
                nameKey="planName"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(1)}%)`
                }
              >
                {exercises.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomExerciseTooltip />} />
              {/* <Legend layout="vertical" align="right" verticalAlign="middle" /> */}
            </PieChart>
          </div>
        </div>
        <div className="w-full border rounded-md shadow p-4">
          <p className="font-semibold text-2xl">Top 5 Meals</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={meals}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="planName"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomMealTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="calories"
                fill="#ecaa74"
                name="Calories"
              />
              <Bar
                yAxisId="right"
                dataKey="chosenBy"
                fill="#3b82f6"
                name="Chosen By"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-row w-full p-4 gap-x-4 h-1/2">
        <div className="w-full border rounded-md shadow p-4 flex flex-col h-full overflow-y-auto">
          <p className="font-semibold text-2xl">Current Challenges</p>
          <div className="flex flex-col h-full">
            {challenges.map((challenge, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-row gap-x-4 p-4 border-b items-center hover:bg-green-50"
                >
                  <div className="w-1/4">
                    <img
                      src={challenge.thumbnail}
                      alt="thumbnail"
                      className="w-16 h-10 object-cover rounded-md"
                    />
                  </div>
                  <div className="w-3/4 flex flex-row justify-between">
                    <p className="font-semibold">{challenge.title}</p>
                    <p>{challenge.participants} participants</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="font-medium items-center justify-center mb-2 flex flex-row gap-x-2">
            Show more <ChevronRight size={16} />
          </p>
        </div>
        <div className="w-full border rounded-md shadow p-4 flex flex-col">
          <p className="font-semibold text-2xl">Top Contributors</p>
          {/* <div className="w-full overflow-auto"> */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Posts</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="h-10 object-cover rounded-full"
                      />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-right">{user.posts}</TableCell>
                    <TableCell className="text-right">{user.point}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="font-medium items-center justify-center mb-2 mt-auto flex flex-row gap-x-2">
            Show more <ChevronRight size={16} />
          </p>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
