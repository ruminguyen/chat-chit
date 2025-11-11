import React from 'react';
import { ArrowLeft, Building, Warehouse, ShieldCheck, Server } from 'lucide-react';
import { ElysianVaultState, UnderworldAsset } from '../../../types';

interface ElysianVaultAppProps {
    onBack: () => void;
    vaultState: ElysianVaultState;
}

const AssetIcon = ({ type }: { type: UnderworldAsset['type'] }) => {
    switch (type) {
        case 'Safehouse':
            return <ShieldCheck className="text-cyan-400" size={24} />;
        case 'Warehouse':
            return <Warehouse className="text-orange-400" size={24} />;
        case 'Front Business':
            return <Building className="text-purple-400" size={24} />;
        case 'Data Center':
            return <Server className="text-green-400" size={24} />;
        default:
            return null;
    }
};

const StatusIndicator = ({ status }: { status: UnderworldAsset['status'] }) => {
    const colorMap = {
        'Operational': 'bg-green-500',
        'Compromised': 'bg-red-500 animate-pulse',
        'Under Surveillance': 'bg-yellow-500',
    };
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${colorMap[status]}`}></div>
            <span className="text-xs">{status}</span>
        </div>
    );
};

const ElysianVaultApp: React.FC<ElysianVaultAppProps> = ({ onBack, vaultState }) => {
    const { assets } = vaultState;

    return (
        <div className="bg-[#0D1018] text-gray-200 h-full flex flex-col font-mono">
            <header className="flex items-center p-3 border-b border-amber-500/30 sticky top-0 bg-[#0D1018] z-10">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold ml-4 tracking-widest text-amber-400">ELYSIAN VAULT</h1>
            </header>

            <div className="p-4">
                <p className="text-sm text-gray-400">Tổng số tài sản được quản lý:</p>
                <p className="text-3xl font-bold text-white">{assets.length}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-3">
                {assets.map(asset => (
                    <div key={asset.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center gap-4 hover:bg-gray-800/80 transition-colors">
                        <div className="p-2 bg-gray-700 rounded-md">
                           <AssetIcon type={asset.type} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white">{asset.name}</p>
                            <p className="text-xs text-gray-400">{asset.location} - {asset.type}</p>
                        </div>
                        <div className="text-right">
                           <StatusIndicator status={asset.status} />
                        </div>
                    </div>
                ))}
            </div>
             <footer className="text-center p-2 text-xs text-gray-600 border-t border-amber-500/30">
                Giao thức mã hóa đầu cuối v3.14
            </footer>
        </div>
    );
};

export default ElysianVaultApp;
