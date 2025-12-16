import React, { useState } from 'react';
import { Transaction, AIReport, LineItem } from '../types';
import { generateFinancialReport } from '../services/geminiService';
import { FileText, Download, RefreshCw, AlertCircle, Stamp, Printer, FileSpreadsheet, FileType } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ReportsProps {
  transactions: Transaction[];
  logAction: (action: string, details: string, entityId?: string) => void;
  userPlan: string;
}

const CurrencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2
});

interface TableRowProps {
  label: string;
  amount?: number;
  isTotal?: boolean;
  isHeader?: boolean;
  isSubtotal?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ label, amount, isTotal = false, isHeader = false, isSubtotal = false }) => (
  <div className={`flex justify-between py-2 border-b border-gray-100 ${isHeader ? 'font-bold text-gray-900 mt-4' : ''} ${isTotal ? 'font-bold text-gray-900 border-t-2 border-gray-800 border-b-double border-b-4' : ''} ${isSubtotal ? 'font-semibold text-gray-700 bg-gray-50 px-2' : ''}`}>
    <span className={`${isTotal ? 'uppercase' : ''} ${isHeader ? 'uppercase text-xs tracking-wider' : ''}`}>{label}</span>
    {amount !== undefined && (
      <span className={isTotal ? 'text-lg' : 'font-mono'}>
        {CurrencyFormatter.format(amount)}
      </span>
    )}
  </div>
);

export const Reports: React.FC<ReportsProps> = ({ transactions, logAction, userPlan }) => {
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleGenerate = async () => {
    if (transactions.length === 0) {
      setError("Please add transactions before generating a report.");
      return;
    }
    setLoading(true);
    setError('');
    logAction('GENERATE_REPORT', 'Initiated AI generation of Financial Statement');
    try {
      const result = await generateFinancialReport(transactions);
      setReport(result);
      logAction('REPORT_SUCCESS', `Financial Report generated successfully for ${result.statementDate}`);
    } catch (err) {
      setError("Failed to generate report using AI. Please try again.");
      logAction('REPORT_FAILED', 'Failed to generate financial report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    logAction('PRINT_REPORT', 'Initiated browser print of financial report');
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    const element = document.getElementById('printable-report');
    if (!element) return;
    
    setGeneratingPdf(true);
    logAction('DOWNLOAD_PDF', 'Started PDF generation for financial report');
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content overflows
        while (heightLeft > 0) {
            position -= pdfHeight; // Shift image up by one page height
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        const filename = `Financial_Statements_${report.statementDate.replace(/\s/g, '_')}.pdf`;
        pdf.save(filename);
        logAction('DOWNLOAD_COMPLETE', `PDF downloaded: ${filename}`);
    } catch (e) {
        console.error("PDF generation error", e);
        setError("Could not generate PDF automatically. Please try the Print button to Save as PDF.");
        logAction('DOWNLOAD_ERROR', 'Failed to generate PDF');
    } finally {
        setGeneratingPdf(false);
    }
  };

  const handleDownloadText = () => {
    if (!report) return;
    
    const income = report.incomeStatement || {};
    const balance = report.balanceSheet || {};

    const textContent = `
${report.companyName?.toUpperCase() || 'COMPANY NAME'}
ANNUAL REPORT & FINANCIAL STATEMENTS
Period Ended: ${report.statementDate}
============================================================

INDEPENDENT AUDITOR'S OPINION
-----------------------------
${report.auditorOpinion || 'No opinion provided.'}

STATEMENT OF PROFIT OR LOSS
---------------------------
Revenue:
${(income.revenueItems || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
------------------------------------------------------------
Total Revenue:                          ${CurrencyFormatter.format(income.totalRevenue || 0)}

Cost of Sales:
${(income.costOfSalesItems || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
------------------------------------------------------------
Total Cost of Sales:                    (${CurrencyFormatter.format(income.totalCostOfSales || 0)})

GROSS PROFIT:                           ${CurrencyFormatter.format(income.grossProfit || 0)}

Operating Expenses:
${(income.operatingExpenses || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
------------------------------------------------------------
Total Operating Expenses:               (${CurrencyFormatter.format(income.totalOperatingExpenses || 0)})

OPERATING PROFIT:                       ${CurrencyFormatter.format(income.operatingProfit || 0)}
Taxation:                               (${CurrencyFormatter.format(income.taxation || 0)})
NET PROFIT FOR THE YEAR:                ${CurrencyFormatter.format(income.netProfit || 0)}

STATEMENT OF FINANCIAL POSITION
-------------------------------
ASSETS
Non-Current Assets:
${(balance.nonCurrentAssets || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}

Current Assets:
${(balance.currentAssets || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
------------------------------------------------------------
TOTAL ASSETS:                           ${CurrencyFormatter.format(balance.totalAssets || 0)}

EQUITY & LIABILITIES
Equity:
${(balance.equityItems || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
Total Equity:                           ${CurrencyFormatter.format(balance.totalEquity || 0)}

Liabilities:
${(balance.currentLiabilities || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
${(balance.nonCurrentLiabilities || []).map(i => `- ${i.description.padEnd(40)} ${CurrencyFormatter.format(i.amount)}`).join('\n')}
Total Liabilities:                      ${CurrencyFormatter.format(balance.totalLiabilities || 0)}
------------------------------------------------------------
TOTAL EQUITY & LIABILITIES:             ${CurrencyFormatter.format((balance.totalEquity || 0) + (balance.totalLiabilities || 0))}

NOTES TO THE ACCOUNTS
---------------------
${(report.notesToAccounts || []).map((n, i) => `${i+1}. ${n}`).join('\n')}

------------------------------------------------------------
Generated by FOJ's Finance AI | Stellar Network Verified
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Financial_Statements_${(report.statementDate || 'draft').replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('DOWNLOAD_TEXT', 'Downloaded report as text file');
  };

  const handleExportLedger = () => {
    const headers = ["ID", "Date", "Description", "Category", "Type", "Amount", "Status", "Stellar Hash"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => [
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
    link.download = `Transaction_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('EXPORT_CSV', 'Downloaded full ledger as CSV from Reports page');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-sm text-gray-500">Generate Audit-Ready Financial Statements</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleExportLedger}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                title="Download all transactions as CSV"
            >
                <FileSpreadsheet size={18} className="text-green-600" />
                <span className="hidden sm:inline">Export Ledger (CSV)</span>
            </button>
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
            >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
                {loading ? 'Auditing Ledger...' : 'Generate Statement'}
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-100 no-print">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {report ? (
        <div className="animate-fade-in pb-10">
          {/* Document Container */}
          <div id="printable-report" className="max-w-4xl mx-auto bg-white shadow-xl shadow-gray-200/50 min-h-[1000px] relative">
             {/* Print/Download Toolbar */}
             <div className="absolute top-4 right-4 flex gap-2 no-print">
                <button 
                    onClick={handleDownloadPDF}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                    title="Download as PDF"
                    disabled={generatingPdf}
                >
                    {generatingPdf ? <RefreshCw className="animate-spin" size={20} /> : <FileType size={20} />}
                </button>
                <button 
                    onClick={handlePrint}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full" 
                    title="Print"
                >
                    <Printer size={20} />
                </button>
                <button 
                    onClick={handleDownloadText}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full" 
                    title="Download Report as Text"
                >
                    <Download size={20} />
                </button>
             </div>

            <div className="p-12 md:p-16 space-y-12">
                
                {/* Header Section */}
                <div className="text-center border-b-2 border-gray-900 pb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-wide mb-2">{report.companyName}</h1>
                    <h2 className="text-xl text-gray-600 uppercase tracking-widest font-light">Annual Report & Financial Statements</h2>
                    <p className="text-sm text-gray-500 mt-2 font-mono">For the period ended {report.statementDate}</p>
                </div>

                {/* Auditor Opinion */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                         <Stamp className="text-indigo-900" size={24} />
                         <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900">Independent Auditor's Report</h3>
                    </div>
                    <div className="text-justify text-gray-700 leading-relaxed text-sm bg-gray-50 p-6 border-l-4 border-indigo-900 italic">
                        {report.auditorOpinion || 'No auditor opinion generated.'}
                    </div>
                </section>

                {/* Statement of Profit or Loss */}
                <section className="break-inside-avoid">
                    <h3 className="text-center text-lg font-bold uppercase tracking-wider text-gray-900 mb-1">Statement of Profit or Loss</h3>
                    <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-6">And Other Comprehensive Income</p>
                    
                    <div className="space-y-1 text-sm">
                        <TableRow label="Revenue" isHeader />
                        {(report.incomeStatement?.revenueItems || []).map((item, i) => (
                             <TableRow key={i} label={item.description} amount={item.amount} />
                        ))}
                        <TableRow label="Total Revenue" amount={report.incomeStatement?.totalRevenue || 0} isSubtotal />

                        <TableRow label="Cost of Sales" isHeader />
                        {(report.incomeStatement?.costOfSalesItems || []).length > 0 ? (
                            (report.incomeStatement?.costOfSalesItems || []).map((item, i) => (
                                <TableRow key={i} label={item.description} amount={-item.amount} />
                            ))
                        ) : (
                            <TableRow label="Cost of Sales" amount={0} />
                        )}
                        
                        <TableRow label="Gross Profit" amount={report.incomeStatement?.grossProfit || 0} isTotal />

                        <TableRow label="Operating Expenses" isHeader />
                        {(report.incomeStatement?.operatingExpenses || []).map((item, i) => (
                             <TableRow key={i} label={item.description} amount={-item.amount} />
                        ))}
                        <TableRow label="Total Operating Expenses" amount={-(report.incomeStatement?.totalOperatingExpenses || 0)} isSubtotal />

                        <TableRow label="Operating Profit" amount={report.incomeStatement?.operatingProfit || 0} isTotal />
                        
                        <TableRow label="Taxation" amount={-(report.incomeStatement?.taxation || 0)} />
                        
                        <div className="mt-4 pt-2">
                             <TableRow label="Profit for the year" amount={report.incomeStatement?.netProfit || 0} isTotal />
                        </div>
                    </div>
                </section>

                {/* Statement of Financial Position */}
                <section className="break-inside-avoid pt-8 border-t border-gray-200">
                    <h3 className="text-center text-lg font-bold uppercase tracking-wider text-gray-900 mb-6">Statement of Financial Position</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                        {/* Assets */}
                        <div>
                            <h4 className="font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase text-xs">Assets</h4>
                            
                            <div className="mb-6">
                                <p className="font-semibold text-gray-700 mb-2 underline">Non-Current Assets</p>
                                {(report.balanceSheet?.nonCurrentAssets || []).length > 0 ? (
                                    (report.balanceSheet?.nonCurrentAssets || []).map((item, i) => (
                                        <TableRow key={i} label={item.description} amount={item.amount} />
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic text-xs py-2">No non-current assets</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="font-semibold text-gray-700 mb-2 underline">Current Assets</p>
                                {(report.balanceSheet?.currentAssets || []).map((item, i) => (
                                    <TableRow key={i} label={item.description} amount={item.amount} />
                                ))}
                            </div>

                            <TableRow label="Total Assets" amount={report.balanceSheet?.totalAssets || 0} isTotal />
                        </div>

                        {/* Equity & Liabilities */}
                        <div>
                             <h4 className="font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase text-xs">Equity & Liabilities</h4>
                            
                             <div className="mb-6">
                                <p className="font-semibold text-gray-700 mb-2 underline">Equity</p>
                                {(report.balanceSheet?.equityItems || []).map((item, i) => (
                                    <TableRow key={i} label={item.description} amount={item.amount} />
                                ))}
                                <TableRow label="Total Equity" amount={report.balanceSheet?.totalEquity || 0} isSubtotal />
                            </div>

                            <div className="mb-6">
                                <p className="font-semibold text-gray-700 mb-2 underline">Liabilities</p>
                                {(report.balanceSheet?.currentLiabilities || []).length > 0 ? (
                                    (report.balanceSheet?.currentLiabilities || []).map((item, i) => (
                                        <TableRow key={i} label={item.description} amount={item.amount} />
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic text-xs py-2">No liabilities</p>
                                )}
                                <TableRow label="Total Liabilities" amount={report.balanceSheet?.totalLiabilities || 0} isSubtotal />
                            </div>

                            <TableRow label="Total Equity & Liabilities" amount={(report.balanceSheet?.totalEquity || 0) + (report.balanceSheet?.totalLiabilities || 0)} isTotal />
                        </div>
                    </div>
                </section>

                {/* Notes */}
                <section className="pt-8 border-t border-gray-200">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Notes to the Financial Statements</h3>
                     <ul className="list-decimal pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                        {(report.notesToAccounts || []).map((note, i) => (
                            <li key={i}>{note}</li>
                        ))}
                     </ul>
                </section>

                <div className="pt-12 mt-12 border-t-2 border-gray-900 flex justify-between items-end text-xs text-gray-500">
                    <div>
                        <p>Signed on behalf of the Board of Directors by:</p>
                        <div className="mt-8 flex gap-8">
                            <div className="border-t border-gray-400 w-32 pt-1 text-center">Director</div>
                            <div className="border-t border-gray-400 w-32 pt-1 text-center">Director</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p>Generated by FOJ's Finance AI</p>
                        <p>Stellar Network Verification ID: #7834-XJ9</p>
                    </div>
                </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-gray-400 text-center min-h-[400px]">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <FileText size={48} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Financial Statements Generated</h3>
            <p className="max-w-md mt-2 text-sm text-gray-500">
                Click the button above to have our AI Auditor analyze your blockchain ledger and produce a standard IFRS-compliant financial report.
            </p>
        </div>
      )}
    </div>
  );
};