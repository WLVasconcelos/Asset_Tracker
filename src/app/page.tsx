'use client';

import { useState, useEffect } from 'react';

interface Movement {
  _id: string;
  docId: string;
  assetId: string;
  item: string;
  reason: string;
  exitDate: string;
  expectedReturn?: string;
  requiresReturn: boolean;
  responsible: string;
  origin: string;
  sender: string;
  status: 'OUT' | 'RETURNED';
  actualReturnDate?: string;
}

export default function Dashboard() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    docId: '',
    assetId: '',
    item: '',
    reason: '',
    expectedReturn: '',
    requiresReturn: true,
    responsible: '',
    origin: '',
    sender: ''
  });

  async function fetchData() {
    try {
      const res = await fetch('/api/movements');
      const data = await res.json();
      setMovements(data.movements || []);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (id: string) => {
    if (confirm('Confirmar o retorno deste ativo?')) {
      try {
        const res = await fetch(`/api/movements/${id}/return`, { method: 'PUT' });
        if (res.ok) {
          fetchData(); // Refresh all data to update status
        }
      } catch (error) {
        alert('Erro ao processar retorno');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Movimento salvo com sucesso!');
        setShowForm(false);
        setFormData({
          docId: '',
          assetId: '',
          item: '',
          reason: '',
          expectedReturn: '',
          requiresReturn: true,
          responsible: '',
          origin: '',
          sender: ''
        });
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Erro ao salvar: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro de conexão ao salvar movimento');
    }
  };

  const activeMovements = movements.filter(m => m.status === 'OUT');

  return (
    <main className="container">
      <div className="card">
        <h2>Dashboard de Ativos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <p style={{ color: '#1e40af', fontWeight: 'bold' }}>Ativos Fora</p>
            <h3 style={{ fontSize: '2rem' }}>{activeMovements.length}</h3>
          </div>
          <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <p style={{ color: '#065f46', fontWeight: 'bold' }}>No Prazo</p>
            <h3 style={{ fontSize: '2rem' }}>{activeMovements.filter(m => !m.requiresReturn || (m.expectedReturn && new Date(m.expectedReturn) >= new Date())).length}</h3>
          </div>
          <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
            <p style={{ color: '#9f1239', fontWeight: 'bold' }}>Atrasados</p>
            <h3 style={{ fontSize: '2rem' }}>{activeMovements.filter(m => m.requiresReturn && m.expectedReturn && new Date(m.expectedReturn) < new Date()).length}</h3>
          </div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#475569', fontWeight: 'bold' }}>Total Retornados</p>
            <h3 style={{ fontSize: '2rem' }}>{movements.filter(m => m.status === 'RETURNED').length}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Movimentações de Ativos</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Fechar Formulário' : 'Registrar Saída'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Documento (Docto Saída)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.docId} 
                    onChange={e => setFormData({...formData, docId: e.target.value})}
                    placeholder="Ex: 00001" 
                  />
                </div>
                <div className="form-group">
                  <label>Ativo (Código Base)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.assetId} 
                    onChange={e => setFormData({...formData, assetId: e.target.value})}
                    placeholder="Ex: MAQ001" 
                  />
                </div>
                <div className="form-group">
                  <label>Descrição do Item</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.item} 
                    onChange={e => setFormData({...formData, item: e.target.value})}
                    placeholder="Ex: 0001" 
                  />
                </div>
                <div className="form-group">
                  <label>Motivo da Saída</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.reason} 
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    placeholder="Ex: Conserto Motor" 
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="requiresReturn"
                    checked={formData.requiresReturn} 
                    onChange={e => setFormData({...formData, requiresReturn: e.target.checked})}
                  />
                  <label htmlFor="requiresReturn" style={{ marginBottom: 0 }}>Exige Retorno?</label>
                </div>
                <div className="form-group">
                  <label>Previsão de Retorno</label>
                  <input 
                    type="date" 
                    required={formData.requiresReturn}
                    disabled={!formData.requiresReturn}
                    value={formData.expectedReturn} 
                    onChange={e => setFormData({...formData, expectedReturn: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Responsável / Destino</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})}
                    placeholder="Ex: Oficina Mecânica" 
                  />
                </div>
                <div className="form-group">
                  <label>Setor Origem</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.origin} 
                    onChange={e => setFormData({...formData, origin: e.target.value})}
                    placeholder="Ex: Fábrica" 
                  />
                </div>
                <div className="form-group">
                  <label>Quem Enviou</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.sender} 
                    onChange={e => setFormData({...formData, sender: e.target.value})}
                    placeholder="Seu Nome" 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Salvar Movimento</button>
            </form>
          </div>
        )}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Ativo</th>
                  <th>Motivo</th>
                  <th>Data Saída</th>
                  <th>Previsão / Retorno</th>
                  <th>Destino Responsável</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mov) => (
                  <tr key={mov._id} style={{ opacity: mov.status === 'RETURNED' ? 0.7 : 1 }}>
                    <td>{mov.docId}</td>
                    <td>{mov.assetId} / {mov.item}</td>
                    <td>{mov.reason}</td>
                    <td>{new Date(mov.exitDate).toLocaleDateString('pt-BR')}</td>
                    <td>
                      {mov.status === 'RETURNED' ? (
                        <span style={{ color: '#059669' }}>
                          Retornou em: {mov.actualReturnDate ? new Date(mov.actualReturnDate).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      ) : (
                        mov.requiresReturn ? (
                          <span style={{ color: mov.expectedReturn && new Date(mov.expectedReturn) < new Date() ? '#dc2626' : 'inherit' }}>
                            {mov.expectedReturn ? new Date(mov.expectedReturn).toLocaleDateString('pt-BR') : 'Não definida'}
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>Sem retorno</span>
                        )
                      )}
                    </td>
                    <td>{mov.responsible}</td>
                    <td>
                      {mov.status === 'OUT' ? (
                        <span className="badge badge-warning">Fora</span>
                      ) : (
                        <span className="badge badge-success">Retornado</span>
                      )}
                    </td>
                    <td>
                      {mov.status === 'OUT' && mov.requiresReturn && (
                        <button 
                          className="btn" 
                          style={{ background: '#e2e8f0', fontSize: '0.8rem' }}
                          onClick={() => handleReturn(mov._id)}
                        >
                          Dar Entrada
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>Nenhuma movimentação registrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
