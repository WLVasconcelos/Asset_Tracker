interface AssetProps {
  id: string;
  motivo: string;
  dataSaida: string;
  previsao: string;
  responsavel: string;
}

export default function AssetCard({ asset }: { asset: AssetProps }) {
  // Cálculo de dias fora (Simples)
  const diasFora = Math.floor((new Date().getTime() - new Date(asset.dataSaida).getTime()) / (1000 * 3600 * 24));

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mb-4">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">Ativo: {asset.id}</h3>
        <span className={`px-2 py-1 rounded text-xs ${diasFora > 15 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {diasFora} dias fora
        </span>
      </div>
      <p className="text-gray-600 text-sm mt-2"><strong>Motivo:</strong> {asset.motivo}</p>
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
        <div>📅 Saída: {new Date(asset.dataSaida).toLocaleDateString()}</div>
        <div>⏳ Prev. Retorno: {new Date(asset.previsao).toLocaleDateString()}</div>
      </div>
    </div>
  );
}