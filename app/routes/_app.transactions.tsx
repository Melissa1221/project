import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { supabase } from "~/services/supabase.server";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  return json({ transactions });
}

export default function Transactions() {
  const { transactions } = useLoaderData<typeof loader>();

  const chartData = transactions?.reduce((acc: any[], transaction) => {
    const date = format(new Date(transaction.date), "MMM dd");
    const existing = acc.find((item) => item.date === date);

    if (existing) {
      if (transaction.type === "income") {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
    } else {
      acc.push({
        date,
        income: transaction.type === "income" ? transaction.amount : 0,
        expenses: transaction.type === "expense" ? transaction.amount : 0,
      });
    }

    return acc;
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button>Add Transaction</Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <Card className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
            <div className="w-full h-[300px]">
              <LineChart width={800} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" />
              </LineChart>
            </div>
          </div>

          <div className="space-y-4">
            {transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.date), "PPP")}
                  </p>
                  {transaction.description && (
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                  )}
                </div>
                <p
                  className={`font-semibold ${
                    transaction.type === "expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {transaction.type === "expense" ? "-" : "+"}$
                  {transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Tabs>
    </div>
  );
}