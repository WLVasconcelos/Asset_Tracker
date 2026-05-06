import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movement from '@/models/Movement';

export async function GET() {
  try {
    console.log('GET /api/movements - Connecting to DB...');
    await dbConnect();
    console.log('GET /api/movements - DB Connected, fetching movements...');
    const movements = await Movement.find({}).sort({ exitDate: -1 });
    console.log(`GET /api/movements - Found ${movements.length} movements.`);
    return NextResponse.json({ movements });
  } catch (error: any) {
    console.error('GET /api/movements - Error:', error);
    return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/movements - Received body:', body);
    
    await dbConnect();
    console.log('POST /api/movements - DB Connected, creating movement...');
    
    const movement = await Movement.create(body);
    console.log('POST /api/movements - Movement created:', movement._id);
    
    return NextResponse.json(movement, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/movements - Error:', error);
    return NextResponse.json({ error: 'Failed to create', details: error.message }, { status: 400 });
  }
}
