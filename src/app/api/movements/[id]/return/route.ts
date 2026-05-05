import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movement from '@/models/Movement';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const movement = await Movement.findByIdAndUpdate(
      id,
      { 
        status: 'RETURNED', 
        actualReturnDate: new Date() 
      },
      { new: true }
    );

    if (!movement) {
      return NextResponse.json({ error: 'Movement not found' }, { status: 404 });
    }

    return NextResponse.json(movement);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}
