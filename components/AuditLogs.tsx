import React from 'react';
import { AuditLogEntry } from '../types';
import { ShieldAlert, Clock, User, FileOutput } from 'lucide-react';
import { FeatureGate } from './FeatureGate';

interface AuditLogsProps {
  logs: AuditLogEntry[];
  userPlan: string;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs, userPlan }) => {
  return (
    <FeatureGate
      currentPlan={userPlan}
      requiredPlans={['Startup', 'Enterprise']}
      title="Advanced Security Audit Logs"
      description="Track every action and system event with an immutable audit trail, available on Startup and Enterprise plans."
      features={["Immutable timestamps", "User action tracking", "Stellar hash references"]}
    >
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Audit Logs</h2>
            <p className="text-sm text-gray-500">Traceable record of all system activities and user actions.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
            <ShieldAlert size={18} />
            <span>Immutable Record Mode</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                       <div className="flex flex-col items-center gap-2">
                         <Clock size={32} className="opacity-20" />
                         <p>No activity recorded in this session yet.</p>
                       </div>
                     </td>
                   </tr>
                ) : (
                  logs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString('en-NG')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User size={14} className="text-gray-400" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${log.action.includes('CREATE') ? 'bg-green-100 text-green-800' : 
                            log.action.includes('DELETE') ? 'bg-red-100 text-red-800' :
                            log.action.includes('GENERATE') ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.details}
                        {log.entityId && (
                          <span className="ml-2 text-xs font-mono text-gray-400 bg-gray-50 px-1 rounded">
                            ID: {log.entityId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};