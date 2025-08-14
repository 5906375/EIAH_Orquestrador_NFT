export default function KycPolicy() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">Política de KYC/AML & Sanções</h1>
            <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
                <li>Identificação de anfitriões: RG/CNH/passaporte, comprovante de endereço e dados bancários.</li>
                <li>Verificações em listas (OFAC, ONU, COAF) e validações de CPF/CNPJ.</li>
                <li>Bloqueio por dados falsos/indícios de fraude; revisão via SAC em até 10 dias úteis.</li>
            </ul>
        </div>
    );
}
