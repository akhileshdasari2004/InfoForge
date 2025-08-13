import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    // In development mode, bypass authentication for testing
    let userId: string = 'test-user';
    
    // Only check authentication in production
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions);
      const sessionUserId = (session?.user as { id?: string })?.id;

      if (!sessionUserId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      userId = sessionUserId;
      console.log(userId);
    }

    const { query, data } = await request.json();
    
    const searchResults = await aiService.searchData(query, data);
    
    return NextResponse.json({ results: searchResults });
  } catch (error) {
    console.error('AI Search Error:', error);
    return NextResponse.json(
      { message: 'AI search failed' },
      { status: 500 }
    );
  }
}
