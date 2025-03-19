import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BarChart, LineChart } from "recharts";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // TODO: Fetch actual financial data
  const mockData = {
    income: 5000,
    expenses: 3500,
    categories: [
      { name: "Food", amount: 800 },
      { name: "Transport", amount: 400 },
      { name: "Entertainment", amount: 300 },
      { name: "Bills", amount: 2000 },
    ],
    recentTransactions: [
      {
        id: 1,
        type: "expense",
        amount: 50,
        category: "Food",
        date: new Date().toISOString(),
      },
      // Add more mock transactions
    ],
  };

  return json({ user, ...mockData });
}

export default function Dashboard() {
  const { user, income, expenses, categories, recentTransactions } =
    useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income vs Expenses Overview */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
          {/* Add LineChart component here */}
        </div>

        {/* Expense Categories */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          {/* Add BarChart component here */}
        </div>

        {/* Recent Transactions */}
        <div className="col-span-1 md:col-span-2 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
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
        </div>
      </div>
    </div>
  );
}