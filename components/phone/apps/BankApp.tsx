
import React from 'react';
import { ArrowLeft, ArrowRight, CreditCard, HelpCircle, Home } from 'lucide-react';
import { BankState } from '../../../types';

interface BankAppProps {
    onBack: () => void;
    bankState: BankState;
}

const BankApp: React.FC<BankAppProps> = ({ onBack, bankState }) => {
    return (
        <div className="bg-[#10182A] text-white h-full flex flex-col font-sans">
            <header className="flex items-center p-4">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold ml-4">Elysian Bank</h1>
            </header>
            
            <div className="px-4">
                <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-4 shadow-lg">
                    <p className="text-sm text-gray-300">Tổng số dư</p>
                    <p className="text-3xl font-bold mt-1">¥ {bankState.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                     <div className="flex items-center justify-between mt-4">
                        <p className="font-mono text-sm tracking-widest">**** **** **** 8888</p>
                        <p className="font-bold text-yellow-300">ELYSIAN</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 mt-2">
                <div className="flex flex-col items-center gap-1"><div className="bg-blue-900/50 p-3 rounded-full"><ArrowRight size={20}/></div><p className="text-xs mt-1">Chuyển khoản</p></div>
                <div className="flex flex-col items-center gap-1"><div className="bg-blue-900/50 p-3 rounded-full"><CreditCard size={20}/></div><p className="text-xs mt-1">Thanh toán</p></div>
                <div className="flex flex-col items-center gap-1"><div className="bg-blue-900/50 p-3 rounded-full"><CreditCard size={20}/></div><p className="text-xs mt-1">Thẻ</p></div>
                <div className="flex flex-col items-center gap-1"><div className="bg-blue-900/50 p-3 rounded-full"><HelpCircle size={20}/></div><p className="text-xs mt-1">Hỗ trợ</p></div>
            </div>

            <div className="flex-1 px-4 overflow-y-auto mt-2">
                <h2 className="font-bold mb-2">Lịch sử giao dịch</h2>
                <div className="space-y-3">
                    {bankState.transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                             <div className="flex items-center">
                                <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {tx.type === 'income' ? '💰' : '🛒'}
                                </div>
                                <div className="ml-3">
                                    <p className="font-semibold">{tx.description}</p>
                                    <p className="text-xs text-gray-400">{tx.date}</p>
                                </div>
                            </div>
                            <p className={`font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                                {tx.type === 'income' ? '+' : ''}¥{Math.abs(tx.amount).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="grid grid-cols-4 p-2 border-t border-gray-700 mt-2">
                 <div className="flex flex-col items-center gap-1 text-blue-400"><Home size={22}/><p className="text-xs">Trang chủ</p></div>
                 <div className="flex flex-col items-center gap-1 text-gray-400"><ArrowRight size={22}/><p className="text-xs">Chuyển khoản</p></div>
                 <div className="flex flex-col items-center gap-1 text-gray-400"><CreditCard size={22}/><p className="text-xs">Thẻ</p></div>
                 <div className="flex flex-col items-center gap-1 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><p className="text-xs">Hồ sơ</p></div>
            </footer>
        </div>
    );
};

export default BankApp;
