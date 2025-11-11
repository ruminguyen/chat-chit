
import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { CharacterState, FoodItem } from '../../../types';
import { umeEatsMenu } from '../../../constants';
import { playAppOpenSound } from '../../../utils/audioEffects';

interface UmeEatsAppProps {
    onBack: () => void;
    characterState: CharacterState;
    setCharacterState: React.Dispatch<React.SetStateAction<CharacterState>>;
}

const UmeEatsApp: React.FC<UmeEatsAppProps> = ({ onBack, characterState, setCharacterState }) => {
    const [confirmingItem, setConfirmingItem] = useState<FoodItem | null>(null);

    const handlePurchase = (item: FoodItem) => {
        const currentBalance = characterState.apps.bank.balance;
        if (currentBalance < item.price) {
            alert("Tài khoản không đủ. Vui lòng nạp thêm tiền.");
            setConfirmingItem(null);
            return;
        }

        setCharacterState(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            
            // Deduct from bank balance
            newState.apps.bank.balance -= item.price;
            
            // Add new transaction
            const newTransaction = {
                id: `tx_ume_${Date.now()}`,
                type: 'expense' as const,
                description: `Ume Eats: ${item.name}`,
                amount: item.price,
                date: "Hôm nay"
            };
            newState.apps.bank.transactions.unshift(newTransaction);
            
            return newState;
        });
        
        playAppOpenSound(); // Re-use sound for success
        setConfirmingItem(null);
    };

    return (
        <div className="bg-gray-50 text-gray-800 h-full flex flex-col">
            <header className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
                <button onClick={onBack}><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold ml-4 text-orange-500">Ume Eats</h1>
            </header>
            
            <div className="flex-1 p-2 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                    {umeEatsMenu.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-24 object-cover" />
                            <div className="p-2 flex flex-col flex-1">
                                <h3 className="font-semibold text-sm flex-grow">{item.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm font-bold text-orange-600">
                                        {item.price.toLocaleString('vi-VN')}đ
                                    </p>
                                    <button 
                                        onClick={() => setConfirmingItem(item)}
                                        className="p-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600"
                                        aria-label={`Mua ${item.name}`}
                                    >
                                        <ShoppingCart size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {confirmingItem && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-xs text-center">
                        <h2 className="font-bold text-lg mb-2">Xác nhận mua hàng</h2>
                        <p className="text-gray-600 mb-4">
                            Bạn có muốn mua "{confirmingItem.name}" với giá {confirmingItem.price.toLocaleString('vi-VN')}đ không?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setConfirmingItem(null)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Không
                            </button>
                            <button 
                                onClick={() => handlePurchase(confirmingItem)}
                                className="px-8 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                            >
                                Có
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UmeEatsApp;
