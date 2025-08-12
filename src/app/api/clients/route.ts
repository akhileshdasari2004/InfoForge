import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const rawClients = await request.json();
    await dbConnect();

    // Remove existing clients for this user
    await Client.deleteMany({ userId });

    const invalidClients: any[] = [];

    // Map and transform incoming data
    const clientsToInsert = rawClients.map((client: any, idx: number) => {
      const clientId =
        client.ClientID || client.clientId || client.id || `auto-id-${idx}`;
      const clientName =
        client.ClientName ||
        client.clientName ||
        client.name ||
        `Unnamed Client ${idx + 1}`;

      if (!clientId || !clientName) {
        invalidClients.push({ index: idx, original: client });
      }

      return {
        userId,
        clientId,
        clientName,
        priorityLevel: Number(client.PriorityLevel || client.priorityLevel || 1),
        requestedTaskIds:
          client.RequestedTaskIDs || client.requestedTaskIds || [],
        groupTag: client.GroupTag || client.groupTag || '',
        attributesJson: client.AttributesJSON || client.attributesJson || {},
      };
    });

    // If any invalid clients are found, return them instead of inserting
    if (invalidClients.length > 0) {
      return NextResponse.json(
        {
          message:
            'Some clients are missing required fields: clientId or clientName',
          invalidClients,
        },
        { status: 400 }
      );
    }

    const insertedClients = await Client.insertMany(clientsToInsert);
    return NextResponse.json(insertedClients, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
