import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, Target, Trash2, Edit3 } from 'lucide-react';
import './App.css';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  const categories = {
    expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other']
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financeTrackerTransactions');
    const savedBudgets = localStorage.getItem('financeTrackerBudgets');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Initialize with sample data if no saved data
      const sampleTransactions = [
        { id: 1, type: 'income', amount: 5000, category: 'Salary', description: 'Monthly salary', date: '2024-06-01' },
        { id: 2, type: 'expense', amount: 1200, category: 'Bills', description: 'Rent payment', date: '2024-06-01' },
        { id: 3, type: 'expense', amount: 300, category: 'Food', description: 'Groceries', date: '2024-06-03' },
        { id: 4, type: 'expense', amount: 150, category: 'Entertainment', description: 'Movie night', date: '2024-06-05' }
      ];
      setTransactions(sampleTransactions);
      localStorage.setItem('financeTrackerTransactions', JSON.stringify(sampleTransactions));
    }
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      // Initialize with sample budgets
      const sampleBudgets = [
        { id: 1, category: 'Food', amount: 500, period: 'monthly' },
        { id: 2, category: 'Entertainment', amount: 200, period: 'monthly' },
        { id: 3, category: 'Transportation', amount: 300, period: 'monthly' }
      ];
      setBudgets(sampleBudgets);
      localStorage.setItem('financeTrackerBudgets', JSON.stringify(sampleBudgets));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('financeTrackerTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Save budgets to localStorage whenever budgets change
  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem('financeTrackerBudgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  // Calculate financial metrics
  const calculateMetrics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Category breakdown
    const expensesByCategory = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return { totalIncome, totalExpenses, balance, expensesByCategory, monthlyTransactions };
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!transactionForm.amount || !transactionForm.category || !transactionForm.description) return;
    
    const newTransaction = {
      id: Date.now(),
      ...transactionForm,
      amount: parseFloat(transactionForm.amount)
    };
    
    setTransactions([...transactions, newTransaction]);
    setTransactionForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddingTransaction(false);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction.id);
    setTransactionForm({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setIsAddingTransaction(true);
  };

  const handleUpdateTransaction = (e) => {
    e.preventDefault();
    if (!transactionForm.amount || !transactionForm.category || !transactionForm.description) return;
    
    const updatedTransactions = transactions.map(t => 
      t.id === editingTransaction 
        ? { ...t, ...transactionForm, amount: parseFloat(transactionForm.amount) }
        : t
    );
    
    setTransactions(updatedTransactions);
    setEditingTransaction(null);
    setTransactionForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddingTransaction(false);
  };

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem('financeTrackerTransactions', JSON.stringify(updatedTransactions));
  };

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.amount) return;
    
    const newBudget = {
      id: Date.now(),
      ...budgetForm,
      amount: parseFloat(budgetForm.amount)
    };
    
    setBudgets([...budgets, newBudget]);
    setBudgetForm({ category: '', amount: '', period: 'monthly' });
    setIsAddingBudget(false);
  };

  const getBudgetStatus = (category) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;
    
    const { expensesByCategory } = calculateMetrics();
    const spent = expensesByCategory[category] || 0;
    const percentage = (spent / budget.amount) * 100;
    
    return { budget: budget.amount, spent, percentage };
  };

  const metrics = calculateMetrics();

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Personal Finance Tracker</h1>
          <p>Take control of your financial future</p>
        </div>

        {/* Navigation */}
        <div className="navigation">
          <div className="nav-container">
            {['dashboard', 'transactions', 'budgets', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`nav-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            {/* Financial Overview Cards */}
            <div className="overview-cards">
              <div className="card income-card">
                <div className="card-content">
                  <div className="card-info">
                    <p className="card-label">Total Income</p>
                    <p className="card-amount income">${metrics.totalIncome.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="card-icon" />
                </div>
              </div>
              
              <div className="card expense-card">
                <div className="card-content">
                  <div className="card-info">
                    <p className="card-label">Total Expenses</p>
                    <p className="card-amount expense">${metrics.totalExpenses.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="card-icon" />
                </div>
              </div>
              
              <div className="card balance-card">
                <div className="card-content">
                  <div className="card-info">
                    <p className="card-label">Balance</p>
                    <p className={`card-amount ${metrics.balance >= 0 ? 'positive' : 'negative'}`}>
                      ${metrics.balance.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="card-icon" />
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
              <h3>Recent Transactions</h3>
              <div className="transactions-list">
                {metrics.monthlyTransactions.slice(-5).reverse().map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className={`transaction-indicator ${transaction.type}`}></div>
                      <div>
                        <p className="transaction-description">{transaction.description}</p>
                        <p className="transaction-details">{transaction.category} • {transaction.date}</p>
                      </div>
                    </div>
                    <p className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Transactions</h2>
              <button
                onClick={() => setIsAddingTransaction(true)}
                className="primary-button"
              >
                <PlusCircle className="button-icon" />
                <span>Add Transaction</span>
              </button>
            </div>

            {/* Add/Edit Transaction Form */}
            {isAddingTransaction && (
              <div className="card">
                <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={transactionForm.type}
                      onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value, category: ''})}
                      className="form-input"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={transactionForm.category}
                      onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select Category</option>
                      {categories[transactionForm.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <input
                      type="text"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                      className="form-input"
                      placeholder="Enter description"
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button
                      onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                      className="primary-button"
                    >
                      {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingTransaction(false);
                        setEditingTransaction(null);
                        setTransactionForm({
                          type: 'expense',
                          amount: '',
                          category: '',
                          description: '',
                          date: new Date().toISOString().split('T')[0]
                        });
                      }}
                      className="secondary-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions List */}
            <div className="card">
              <h3>All Transactions</h3>
              <div className="transactions-list">
                {transactions.slice().reverse().map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className={`transaction-indicator ${transaction.type}`}></div>
                      <div>
                        <p className="transaction-description">{transaction.description}</p>
                        <p className="transaction-details">{transaction.category} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="transaction-actions">
                      <p className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="action-button edit"
                        >
                          <Edit3 className="action-icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="action-button delete"
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Budgets</h2>
              <button
                onClick={() => setIsAddingBudget(true)}
                className="primary-button"
              >
                <Target className="button-icon" />
                <span>Add Budget</span>
              </button>
            </div>

            {/* Add Budget Form */}
            {isAddingBudget && (
              <div className="card">
                <h3>Add New Budget</h3>
                <div className="form-grid budget-form">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select Category</option>
                      {categories.expense.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Period</label>
                    <select
                      value={budgetForm.period}
                      onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                      className="form-input"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      onClick={handleAddBudget}
                      className="primary-button"
                    >
                      Add Budget
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingBudget(false);
                        setBudgetForm({ category: '', amount: '', period: 'monthly' });
                      }}
                      className="secondary-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Budget List */}
            <div className="budget-grid">
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget.category);
                return (
                  <div key={budget.id} className="budget-card">
                    <div className="budget-header">
                      <h3>{budget.category}</h3>
                      <span className="budget-period">{budget.period}</span>
                    </div>
                    
                    {status && (
                      <div className="budget-status">
                        <div className="budget-amounts">
                          <span>Spent: ${status.spent.toLocaleString()}</span>
                          <span>Budget: ${status.budget.toLocaleString()}</span>
                        </div>
                        
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${
                              status.percentage > 100 ? 'over-budget' : 
                              status.percentage > 80 ? 'warning' : 'good'
                            }`}
                            style={{ width: `${Math.min(status.percentage, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="budget-details">
                          <span className={`percentage ${
                            status.percentage > 100 ? 'over-budget' : 
                            status.percentage > 80 ? 'warning' : 'good'
                          }`}>
                            {status.percentage.toFixed(1)}% used
                          </span>
                          <span className="remaining">
                            ${(status.budget - status.spent).toLocaleString()} remaining
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="tab-content">
            <h2>Financial Insights</h2>
            
            {/* Spending by Category */}
            <div className="card">
              <h3>Spending by Category (This Month)</h3>
              <div className="category-breakdown">
                {Object.entries(metrics.expensesByCategory).map(([category, amount]) => {
                  const percentage = (amount / metrics.totalExpenses) * 100;
                  return (
                    <div key={category} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{category}</span>
                        <span className="category-amount">${amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="category-bar">
                        <div
                          className="category-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Health Score */}
            <div className="card">
              <h3>Financial Health Score</h3>
              <div className="health-metrics">
                <div className="metric-item">
                  <span>Savings Rate</span>
                  <span className="metric-value">
                    {metrics.totalIncome > 0 ? ((metrics.balance / metrics.totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="metric-item">
                  <span>Budget Adherence</span>
                  <span className="metric-value">
                    {budgets.length > 0 ? 
                      (budgets.filter(b => {
                        const status = getBudgetStatus(b.category);
                        return status && status.percentage <= 100;
                      }).length / budgets.length * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="metric-item">
                  <span>Monthly Balance</span>
                  <span className={`metric-value ${metrics.balance >= 0 ? 'positive' : 'negative'}`}>
                    {metrics.balance >= 0 ? 'Positive' : 'Negative'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips and Recommendations */}
            <div className="card">
              <h3>Recommendations</h3>
              <div className="recommendations">
                {metrics.balance < 0 && (
                  <div className="recommendation warning">
                    <p>Your expenses exceed your income this month. Consider reducing discretionary spending.</p>
                  </div>
                )}
                {budgets.some(b => {
                  const status = getBudgetStatus(b.category);
                  return status && status.percentage > 100;
                }) && (
                  <div className="recommendation caution">
                    <p>You've exceeded some budget limits. Review your spending in those categories.</p>
                  </div>
                )}
                {metrics.balance > 0 && (
                  <div className="recommendation success">
                    <p>Great job! You have a positive balance this month. Consider setting aside some money for savings.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;