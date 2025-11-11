import React from 'react';
import { ArrowLeft, Video, ShieldAlert, Zap, RadioTower } from 'lucide-react';
import { CerberusState, SecurityDevice } from '../../../types';

interface CerberusAppProps {
    onBack: () => void;
    cerberusState: CerberusState;
}

const DeviceIcon = ({ type }: { type: SecurityDevice['type'] }) => {
    switch (type) {
        case 'Camera':
            return <Video size={20} />;
        case 'Drone':
            return <RadioTower size={20} />;
        case 'Sensor':
            return <Zap size={20} />;
        case 'Turret':
            return <ShieldAlert size={20} />;
        default:
            return null;
    }
};

const StatusPill = ({ status }: { status: SecurityDevice['status'] }) => {
    const styleMap = {
        'Online': 'bg-green-500/20 text-green-400 border-green-500/50',
        'Offline': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        'Alert': 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styleMap[status]}`}>
            {status}
        </span>
    );
};

const CerberusApp: React.FC<CerberusAppProps> = ({ onBack, cerberusState }) => {
    const { devices } = cerberusState;
    const alertCount = devices.filter(d => d.status === 'Alert').length;

    return (
        <div className="bg-[#1A1A2E] text-cyan-200 h-full flex flex-col font-sans">
            <header className="flex items-center justify-between p-3 border-b border-cyan-400/20 sticky top-0 bg-[#1A1A2E] z-10">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-1"><ArrowLeft size={24} /></button>
                    <h1 className="text-xl font-bold ml-4">CERBERUS</h1>
                </div>
                {alertCount > 0 && (
                    <div className="flex items-center gap-2 bg-red-500/80 text-white px-2 py-1 rounded-md text-sm font-bold animate-pulse">
                        <ShieldAlert size={16} />
                        <span>{alertCount} CẢNH BÁO</span>
                    </div>
                )}
            </header>

            <div className="p-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-cyan-900/50 p-2 rounded-lg">
                    <p className="text-lg font-bold">{devices.length}</p>
                    <p className="text-xs text-cyan-300">Tổng thiết bị</p>
                </div>
                <div className="bg-cyan-900/50 p-2 rounded-lg">
                    <p className="text-lg font-bold text-green-400">{devices.filter(d => d.status === 'Online').length}</p>
                    <p className="text-xs text-cyan-300">Đang hoạt động</p>
                </div>
                 <div className="bg-cyan-900/50 p-2 rounded-lg">
                    <p className="text-lg font-bold text-red-400">{alertCount}</p>
                    <p className="text-xs text-cyan-300">Cảnh báo</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2">
                <h2 className="font-semibold text-cyan-300 mb-2">Trạng thái thiết bị</h2>
                {devices.map(device => (
                    <div key={device.id} className="bg-blue-900/40 border border-cyan-400/20 rounded-lg p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <DeviceIcon type={device.type} />
                            <div>
                                <p className="font-semibold text-white">{device.name}</p>
                                <p className="text-xs text-cyan-400">{device.type}</p>
                            </div>
                        </div>
                        <StatusPill status={device.status} />
                    </div>
                ))}
            </div>
             <footer className="text-center p-2 text-xs text-cyan-700 border-t border-cyan-400/20">
                Hệ thống được bảo vệ bởi Elysian Dynamics
            </footer>
        </div>
    );
};

export default CerberusApp;
