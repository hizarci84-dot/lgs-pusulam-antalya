import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { getSecuritySettings, saveSecuritySettings } from '../services/db';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentName?: string;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentName = 'Atakan',
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [targetPin, setTargetPin] = useState('2026');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg(null);
      setIsSuccess(false);
      setShowForgotConfirm(false);
      getSecuritySettings().then((s) => {
        setTargetPin(s.pin || '2026');
      });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (codeToVerify: string) => {
    if (codeToVerify === targetPin) {
      setIsSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        onSuccess();
      }, 350);
    } else {
      setShake(true);
      setErrorMsg('Hatalı şifre girdiniz. Lütfen tekrar deneyin.');
      setPinInput('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const handleKeypadPress = (val: string) => {
    if (isSuccess) return;
    setErrorMsg(null);
    if (val === 'C') {
      setPinInput('');
      return;
    }
    if (val === 'backspace') {
      setPinInput((prev) => prev.slice(0, -1));
      return;
    }
    if (pinInput.length < 4) {
      const next = pinInput + val;
      setPinInput(next);
      if (next.length === 4) {
        handleVerify(next);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPinInput(raw);
    setErrorMsg(null);
    if (raw.length === 4) {
      handleVerify(raw);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pinInput.length > 0) {
      handleVerify(pinInput);
    }
  };

  const handleResetToDefault = async () => {
    await saveSecuritySettings({ pin: '2026', isPinProtected: true });
    setTargetPin('2026');
    setPinInput('');
    setErrorMsg('Şifreniz varsayılan "2026" olarak sıfırlandı. Şimdi 2026 girerek giriş yapabilirsiniz.');
    setShowForgotConfirm(false);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 bg-turquoise-500/20 border border-turquoise-400/30 rounded-2xl text-turquoise-300 mb-3 shadow-inner">
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-pulse" />
            ) : (
              <Lock className="w-7 h-7 text-turquoise-300" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
            Ebeveyn / Yönetici Girişi
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {studentName}'ın profil, lise hedefi ve veri yönetimine erişmek için şifrenizi girin.
          </p>
        </div>

        {/* Hidden Input for Native / Keyboard Support */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pinInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute -z-10 top-0 left-0"
          autoFocus
        />

        {/* PIN Dots Area */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="p-5 cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-3.5 mb-2">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
                    isSuccess
                      ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                      : hasDigit
                      ? 'bg-turquoise-50 border-2 border-turquoise-500 text-navy-900 shadow-sm'
                      : 'bg-slate-50 border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {hasDigit ? (showPin ? pinInput[idx] : '●') : ''}
                </div>
              );
            })}
          </div>

          {/* Toggle reveal */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPin(!showPin);
            }}
            className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1 transition"
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPin ? 'Şifreyi Gizle' : 'Şifreyi Göster'}</span>
          </button>

          {/* Error / Status Feedback */}
          {errorMsg && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Giriş başarılı! Yönlendiriliyorsunuz...</span>
            </div>
          )}
        </div>

        {/* Mobile-Friendly Numeric Keypad */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-navy-900 font-bold text-lg border border-slate-200 transition shadow-xs flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeypadPress('C')}
              className="h-12 rounded-xl bg-slate-100 hover:bg-rose-50 active:bg-rose-100 text-rose-600 font-semibold text-xs border border-slate-200 transition flex items-center justify-center"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-navy-900 font-bold text-lg border border-slate-200 transition shadow-xs flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('backspace')}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-sm border border-slate-200 transition flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>

        {/* Hint and Forgot Password Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs space-y-2">
          {!showForgotConfirm ? (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[11px] text-slate-500">
                Varsayılan Şifre: <strong className="text-navy-900">2026</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowForgotConfirm(true)}
                className="text-[11px] text-turquoise-700 hover:underline font-medium inline-flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                Şifremi Unuttum / Sıfırla
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <p className="text-[11px] text-slate-700">
                Şifrenizi varsayılan <strong>2026</strong> koduna sıfırlamak istiyor musunuz?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotConfirm(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-1 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  2026 Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
