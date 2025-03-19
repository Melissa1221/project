/*
  # Initial Schema Setup for Financial Management App

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `amount` (decimal)
      - `type` (text, 'income' or 'expense')
      - `category` (text)
      - `description` (text)
      - `date` (timestamp)
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `category` (text)
      - `amount` (decimal)
      - `period` (text, 'monthly' or 'annual')
      - `start_date` (timestamp)
    - `financial_advice`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `advice` (text)
      - `category` (text)
      - `created_at` (timestamp)
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `message` (text)
      - `type` (text, 'user' or 'bot')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  amount decimal NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  category text NOT NULL,
  amount decimal NOT NULL,
  period text NOT NULL CHECK (period IN ('monthly', 'annual')),
  start_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create financial_advice table
CREATE TABLE IF NOT EXISTS financial_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  advice text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('user', 'bot')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own financial advice" ON financial_advice
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);