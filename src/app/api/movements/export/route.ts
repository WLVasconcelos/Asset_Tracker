import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movement from '@/models/Movement';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filterType') || 'ALL';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await dbConnect();
    const movements = await Movement.find({}).sort({ exitDate: -1 }).lean();

    const filteredMovements = movements.filter((m: any) => {
      // Categoria
      let matchesCategory = true;
      if (filterType === 'OUT') matchesCategory = m.status === 'OUT';
      else if (filterType === 'DELAYED') {
        matchesCategory = m.status === 'OUT' && m.requiresReturn && m.expectedReturn && new Date(m.expectedReturn) < new Date();
      } else if (filterType === 'NO_RETURN') {
        matchesCategory = m.requiresReturn === false;
      }

      // Período
      let matchesPeriod = true;
      if (startDate && endDate) {
        const exitDate = new Date(m.exitDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesPeriod = exitDate >= start && exitDate <= end;
      }

      return matchesCategory && matchesPeriod;
    });

    const exportData = filteredMovements.map((m: any) => ({
      'Documento': m.docId,
      'Ativo': m.assetId,
      'Item': m.item,
      'Motivo': m.reason,
      'Data Saída': new Date(m.exitDate).toLocaleDateString('pt-BR'),
      'Exige Retorno': m.requiresReturn ? 'Sim' : 'Não',
      'Previsão Retorno': m.expectedReturn ? new Date(m.expectedReturn).toLocaleDateString('pt-BR') : '-',
      'Responsável': m.responsible,
      'Setor Origem': m.origin,
      'Quem Enviou': m.sender,
      'Status': m.status === 'OUT' ? 'Fora' : 'Retornado',
      'Data Retorno Efetivo': m.actualReturnDate ? new Date(m.actualReturnDate).toLocaleDateString('pt-BR') : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimentações');

    // Fix column widths
    const wscols = [
      { wch: 15 }, // Documento
      { wch: 15 }, // Ativo
      { wch: 10 }, // Item
      { wch: 30 }, // Motivo
      { wch: 12 }, // Data Saída
      { wch: 15 }, // Exige Retorno
      { wch: 15 }, // Previsão Retorno
      { wch: 30 }, // Responsável
      { wch: 20 }, // Setor Origem
      { wch: 20 }, // Quem Enviou
      { wch: 12 }, // Status
      { wch: 20 }  // Data Retorno Efetivo
    ];
    worksheet['!cols'] = wscols;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="movimentacoes_${filterType.toLowerCase()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export', details: error.message }, { status: 500 });
  }
}
