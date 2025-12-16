import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/TransactionManager';
import { Reports } from './components/Reports';
import { TaxAI } from './components/TaxAI';
import { AuditLogs } from './components/AuditLogs';
import { LandingPage } from './components/LandingPage';
import { Transaction, TransactionType, TransactionStatus, AuditLogEntry } from './types';
import { Menu, Bell, UserCircle, LogOut } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState('SME');
  const [userEmail, setUserEmail] = useState('admin@acme.com');
  const [userBusinessName, setUserBusinessName] = useState('Acme Corp Ltd');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Mock initial data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_1',
      date: '2023-10-24',
      description: 'Consulting Revenue - Client A',
      amount: 450000,
      type: TransactionType.INCOME,
      category: 'Sales',
      status: TransactionStatus.CONFIRMED,
      stellarHash: 'tx_8f43g87g8743g87f4387f3487f'
    },
    {
      id: 'tx_2',
      date: '2023-10-25',
      description: 'Office Rent Payment',
      amount: 120000,
      type: TransactionType.EXPENSE,
      category: 'Rent',
      status: TransactionStatus.CONFIRMED,
      stellarHash: 'tx_98g78g787g87g87g87g87g87'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Centralized logging function
  const logAction = (action: string, details: string, entityId?: string) => {
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user: userEmail.split('@')[0],
      action,
      details,
      entityId
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  // Auth Handlers
  const handleLogin = (plan: string, email: string, businessName?: string) => {
    setUserPlan(plan);
    setUserEmail(email);
    if (businessName) {
        setUserBusinessName(businessName);
    } else {
        if (email !== 'admin@acme.com') {
             setUserBusinessName(email.split('@')[0] + ' Business');
        }
    }
    setIsLoggedIn(true);
    logAction('USER_LOGIN', `User logged in with ${plan} Plan`);
  };

  const handleLogout = () => {
    logAction('USER_LOGOUT', 'User logged out');
    setIsLoggedIn(false);
    setActiveTab('dashboard'); 
  };

  useEffect(() => {
    if (auditLogs.length === 0 && isLoggedIn) {
      logAction('SYSTEM_STARTUP', 'Application initialized successfully');
    }
  }, [isLoggedIn]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [...prev, newTx]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    if (updatedTx.status === TransactionStatus.CONFIRMED) {
      logAction('BLOCKCHAIN_CONFIRMATION', `Transaction confirmed on Stellar Network`, updatedTx.id);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'ledger':
        return (
          <TransactionManager 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            logAction={logAction}
            userPlan={userPlan}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} logAction={logAction} userPlan={userPlan} />;
      case 'tax-ai':
        return <TaxAI logAction={logAction} userPlan={userPlan} />;
      case 'audit':
        return <AuditLogs logs={auditLogs} userPlan={userPlan} />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
        userPlan={userPlan}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
          
          <div className="md:hidden font-bold text-gray-800 ml-2">FOJ's Finance</div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{userBusinessName}</p>
                <p className="text-xs text-indigo-600 font-semibold">{userPlan} Plan</p>
              </div>
              <div className="bg-indigo-100 p-1.5 rounded-full">
                  <UserCircle size={24} className="text-indigo-600" />
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                  <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;