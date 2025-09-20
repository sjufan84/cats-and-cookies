'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Unit {
  id: number;
  name: string;
  quantity: number;
  price: string;
  isDefault: boolean;
}

interface UnitSelectorProps {
  basePrice: string;
  onUnitChange: (unit: Unit) => void;
  className?: string;
}

export default function UnitSelector({ basePrice, onUnitChange, className = '' }: UnitSelectorProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate default units if none exist
  useEffect(() => {
    const generateDefaultUnits = () => {
      const price = parseFloat(basePrice) || 0;
      return [
        {
          id: 1,
          name: 'Individual',
          quantity: 1,
          price: basePrice,
          isDefault: true,
        },
        {
          id: 2,
          name: 'Half Dozen',
          quantity: 6,
          price: (price * 6 * 0.9).toFixed(2), // 10% discount
          isDefault: false,
        },
        {
          id: 3,
          name: 'Dozen',
          quantity: 12,
          price: (price * 12 * 0.85).toFixed(2), // 15% discount
          isDefault: false,
        },
      ];
    };

    // For now, use default units. In the future, this could fetch from the API
    const defaultUnits = generateDefaultUnits();
    setUnits(defaultUnits);
    
    // Set the default unit as selected
    const defaultUnit = defaultUnits.find(unit => unit.isDefault) || defaultUnits[0];
    setSelectedUnit(defaultUnit);
    
    setLoading(false);
  }, [basePrice]);

  // Call onUnitChange when selectedUnit changes, but only after initial load
  useEffect(() => {
    if (selectedUnit && !loading) {
      onUnitChange(selectedUnit);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit, loading]); // Removed onUnitChange from dependencies to prevent infinite loop

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    onUnitChange(unit);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-md h-10 ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      >
        <div>
          <div className="text-sm font-medium text-gray-900">
            {selectedUnit?.name}
          </div>
          <div className="text-xs text-gray-500">
            ${selectedUnit?.price} ({selectedUnit?.quantity} cookie{selectedUnit?.quantity !== 1 ? 's' : ''})
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {units.map((unit) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => handleUnitSelect(unit)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                selectedUnit?.id === unit.id ? 'bg-pink-50 text-pink-700' : 'text-gray-900'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{unit.name}</div>
                  <div className="text-xs text-gray-500">
                    {unit.quantity} cookie{unit.quantity !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${unit.price}</div>
                  {unit.quantity > 1 && (
                    <div className="text-xs text-gray-500">
                      ${(parseFloat(unit.price) / unit.quantity).toFixed(2)} each
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
