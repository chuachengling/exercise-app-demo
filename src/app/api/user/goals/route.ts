import { NextRequest, NextResponse } from 'next/server';
import { HealthGoalId } from '@/lib/types/healthGoals';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, goalId, selectedAt, isActive } = body;

    console.log('API: Received goal selection request:', { userId, goalId, selectedAt, isActive });

    // Validate required fields
    if (!userId || !goalId) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: userId and goalId' },
        { status: 400 }
      );
    }

    // Validate goalId is one of the accepted values
    const validGoals: HealthGoalId[] = ['weight_loss', 'muscle_gain', 'competition_prep', 'general_health'];
    if (!validGoals.includes(goalId)) {
      console.log('API: Invalid goalId:', goalId);
      return NextResponse.json(
        { error: 'Invalid goalId provided' },
        { status: 400 }
      );
    }

    // For now, just simulate saving (log the data)
    // In a real app, this would save to database
    console.log('✅ Goal preference saved successfully:', {
      userId,
      goalId,
      selectedAt: selectedAt ? new Date(selectedAt) : new Date(),
      isActive: isActive !== undefined ? isActive : true
    });

    // Simulate successful save
    return NextResponse.json(
      { 
        success: true,
        message: 'Goal preference saved successfully', 
        userId, 
        goalId,
        data: {
          userId,
          goalId,
          selectedAt: selectedAt ? new Date(selectedAt) : new Date(),
          isActive: isActive !== undefined ? isActive : true
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ API Error saving goal preference:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}