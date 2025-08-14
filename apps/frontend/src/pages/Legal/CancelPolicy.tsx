export default function CancelPolicy() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">Política de Cancelamento e Estorno</h1>
            <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
                <li>≥ 7 dias antes do check-in: 100% reembolso.</li>
                <li>≥ 48h e &lt; 7 dias: 50% reembolso.</li>
                <li>&lt; 48h: sem reembolso.</li>
            </ul>
            <p className="mt-4 text-gray-700">
                Exceções de força maior podem ser aplicadas. Solicite estorno dentro da plataforma; prazo de análise: até 7 dias úteis.
            </p>
        </div>
    );
}
