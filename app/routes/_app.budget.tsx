import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { supabase } from "~/services/supabase.server";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("period", "monthly");

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  return json({ budgets, transactions });
}

export default function Budget() {
  const { budgets, transactions } = useLoaderData<typeof loader>();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const budgetData = budgets?.map((budget, index) => {
    const spent = transactions
      ?.filter((t) => t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      name: budget.category,
      budget: budget.amount,
      spent,
      remaining: budget.amount - spent,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Budget</h1>
        <Button>Set Budget</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Budget Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  dataKey="budget"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {budgetData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Category Breakdown</h2>
          <div className="space-y-6">
            {budgetData?.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-gray-600">
                    ${category.spent} / ${category.budget}
                  </span>
                </div>
                <Progress
                  value={(category.spent / category.budget) * 100}
                  className="h-2"
                />
                {category.spent > category.budget * 0.9 && (
                  <p className="text-sm text-red-500">
                    Warning: Approaching budget limit
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}