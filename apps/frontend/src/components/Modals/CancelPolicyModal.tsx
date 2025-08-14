import React from "react";

type Props = { open: boolean; onClose: () => void };

export default function CancelPolicyModal({ open, onClose }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                <div className="border-b px-5 py-4">
                    <h3 className="text-lg font-semibold">Política de Cancelamento</h3>
                </div>
                <div className="px-5 py-4 text-sm text-gray-700 space-y-3">
                    <p><strong>≥ 7 dias</strong> antes do check‑in: <strong>100%</strong> reembolso.</p>
                    <p><strong>≥ 48h e &lt; 7 dias</strong>: <strong>50%</strong> reembolso.</p>
                    <p><strong>&lt; 48h</strong>: <strong>sem reembolso</strong>.</p>
                    <p className="text-xs text-gray-500">
                        Exceções de força maior podem se aplicar. Consulte os Termos de Uso.
                    </p>
                </div>
                <div className="flex justify-end gap-3 border-t px-5 py-3">
                    <button onClick={onClose} className="rounded-xl border px-4 py-2 hover:bg-gray-50">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
