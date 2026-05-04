"use client";
import { CheckCircle2 } from 'lucide-react';
import { confirmarEntrega } from '@/app/actions/entregas';
import { useState, useTransition } from 'react';

export default function BotonEntrega({ despachoId }: { despachoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleConfirmar = () => {
    startTransition(async () => {
      const res = await confirmarEntrega(despachoId);
      if (res.success) {
        setSuccess(true);
      } else {
        alert(res.error);
      }
    });
  };

  if (success) {
    return (
      <div className="w-full bg-emerald-500/20 text-emerald-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-emerald-500/50">
        <CheckCircle2 className="w-5 h-5" /> ¡Entrega Confirmada!
      </div>
    );
  }

  return (
    <button 
      onClick={handleConfirmar}
      disabled={isPending}
      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 disabled:opacity-50"
    >
      <CheckCircle2 className="w-5 h-5" /> 
      {isPending ? 'Confirmando...' : 'Confirmar Llegada a Destino'}
    </button>
  );
}
