import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { recordTransactionOnStellar } from '../services/mockStellarService';
import { suggestCategory } from '../services/geminiService';
import { Plus, CheckCircle, Clock, ShieldCheck, Loader2, Sparkles, FileDown, Filter, X, Search, Lock } from 'lucide-react';

interface TransactionManagerProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  logAction: (action: string, details: string, entityId?: string) => void;
  userPlan: string;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, onAddTransaction, onUpdateTransaction, logAction, userPlan }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterSearch, setFilterSearch] = useState('');

  const handleSuggestCategory = async () => {
    if (!description) return;
    setIsAutoCategorizing(true);
    const suggested = await suggestCategory(description);
    setCategory(suggested);
    setIsAutoCategorizing(false);
    logAction('AI_CATEGORIZATION', `Suggested category '${suggested}' for description '${description}'`);
  };

  const handleExportCSV = () => {
    // Use filtered transactions for export if filters are active, otherwise all
    const dataToExport = showFilters ? filteredTransactions : transactions;
    
    const headers = ["ID", "Date", "Description", "Category", "Type", "Amount", "Status", "Stellar Hash"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(t => [
        t.id, 
        t.date, 
        `"${t.description.replace(/"/g, '""')}"`, 
        t.category, 
        t.type, 
        t.amount, 
        t.status, 
        t.stellarHash || ''
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FOJs_Finance_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logAction('EXPORT_DATA', `Exported ${dataToExport.length} transactions to CSV`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      description,
      amount: parseFloat(amount),
      type,
      category: category || 'General',
      status: TransactionStatus.PENDING,
    };

    // Optimistically add to UI
    onAddTransaction(newTx);
    logAction('CREATE_TRANSACTION', `Initiated ${type} transaction: ${description} (₦${newTx.amount})`, newTx.id);
    
    setIsAdding(false);
    
    // Reset form
    setDescription('');
    setAmount('');
    setCategory('');

    // Simulate Blockchain Recording
    try {
      const confirmedTx = await recordTransactionOnStellar(newTx);
      onUpdateTransaction(confirmedTx);
      // Confirmation logging is handled in parent callback
    } catch (err) {
      console.error("Blockchain error", err);
      logAction('TRANSACTION_FAILED', `Failed to record transaction on Stellar: ${description}`, newTx.id);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    // Date Filter
    if (filterDateStart && tx.date < filterDateStart) return false;
    if (filterDateEnd && tx.date > filterDateEnd) return false;

    // Type Filter
    if (filterType !== 'ALL' && tx.type !== filterType) return false;

    // Search Filter (Description or Category)
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      return (
        tx.description.toLowerCase().includes(searchLower) ||
        tx.category.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const clearFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterType('ALL');
    setFilterSearch('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Ledger Entries</h2>
           <p className="text-sm text-gray-500">Manage and track your business transactions</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
                <Filter size={18} />
                <span>Filters</span>
                {showFilters && (
                    <span className="bg-indigo-200 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">
                        {[filterDateStart, filterDateEnd, filterSearch, filterType !== 'ALL'].filter(Boolean).length}
                    </span>
                )}
            </button>
            <button
                onClick={handleExportCSV}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors bg-white text-gray-700 hover:bg-gray-50"
                title="Export Data"
            >
                <FileDown size={18} />
                <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} /> New Entry
            </button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-down">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        placeholder="Description or Category..."
                        className="w-full pl-9 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as TransactionType | 'ALL')}
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                    <option value="ALL">All Types</option>
                    <option value={TransactionType.INCOME}>Income</option>
                    <option value={TransactionType.EXPENSE}>Expense</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-gray-400 self-center">-</span>
                    <input 
                        type="date" 
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex items-end">
                <button 
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1 py-2 px-1"
                >
                    <X size={14} /> Clear Filters
                </button>
            </div>
        </div>
      )}

      {/* Add Transaction Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-fade-in-down">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Record Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <div className="flex gap-2">
                <input 
                  required
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Office Supplies"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button 
                  type="button" 
                  onClick={handleSuggestCategory}
                  className="p-2 rounded-lg transition-colors bg-purple-100 text-purple-600 hover:bg-purple-200"
                  title="Auto-Suggest Category with AI"
                >
                  {isAutoCategorizing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₦)</label>
              <input 
                required
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value={TransactionType.INCOME}>Income</option>
                <option value={TransactionType.EXPENSE}>Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
              <input 
                type="text" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Operations"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
             <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Record to Ledger'}
            </button>
          </div>
        </form>
      )}

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Stellar Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        {transactions.length > 0 ? "No transactions match your filters." : "No transactions recorded yet."}
                   </td>
                 </tr>
              ) : (
                filteredTransactions.slice().reverse().map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === TransactionType.INCOME ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === TransactionStatus.CONFIRMED ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium" title={`Hash: ${tx.stellarHash}`}>
                          <ShieldCheck size={16} />
                          <span>Secured on Stellar</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-medium">
                          <Clock size={16} className="animate-pulse" />
                          <span>Confirming...</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info for table */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>Showing {filteredTransactions.length} of {transactions.length} entries</span>
            {showFilters && (
                <span className="text-indigo-600 font-medium">Filters Active</span>
            )}
        </div>
      </div>
    </div>
  );
};