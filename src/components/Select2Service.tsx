import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Layers, Sparkles } from 'lucide-react';
import { Service } from '../types';

interface Select2ServiceProps {
  services: Service[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
  disabled?: boolean;
}

export const Select2Service: React.FC<Select2ServiceProps> = ({
  services,
  selectedServiceId,
  onSelectService,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) || null;

  const filteredServices = services.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = s.name.toLowerCase().includes(q);
    const matchDetail = s.service_detail?.some(
      (d) =>
        (d.tipe && d.tipe.toLowerCase().includes(q)) ||
        (d.bahan && d.bahan.toLowerCase().includes(q)) ||
        (d.ukuran && d.ukuran.toLowerCase().includes(q))
    );
    return matchName || matchDetail;
  });

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (serviceId: string) => {
    onSelectService(serviceId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectService('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] px-3 py-1.5 bg-white border rounded-lg flex items-center justify-between text-sm transition-all cursor-pointer select-none ${
          disabled
            ? 'opacity-60 bg-slate-100 cursor-not-allowed border-slate-200'
            : isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
          <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
          {selectedService ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-slate-900 truncate">{selectedService.name}</span>
              {selectedService.service_detail && selectedService.service_detail.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shrink-0">
                  {selectedService.service_detail.length} opsi
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-normal text-xs sm:text-sm">
              -- Cari / Pilih Layanan Percetakan (Select2) --
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {selectedService && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180 text-emerald-700' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-80">
          <div className="p-2.5 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama layanan percetakan..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-1">
            {filteredServices.length > 0 ? (
              filteredServices.map((svc, idx) => {
                const isSelected = svc.id === selectedServiceId;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={svc.id}
                    onClick={() => handleSelect(svc.id)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-xs sm:text-sm ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 block truncate">{svc.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 px-4">
                <Sparkles className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                <p className="font-medium text-slate-600">Layanan tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
