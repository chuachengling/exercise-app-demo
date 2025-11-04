// Test script to verify exercise data flow
// Run this in browser console after logging in

console.log('=== Testing Exercise Data Flow ===');

// Check if localStorage has any exercise data
const exerciseData = localStorage.getItem('exercises');
console.log('Current localStorage exercises:', exerciseData);

if (exerciseData) {
  const parsed = JSON.parse(exerciseData);
  console.log('Parsed exercise data:', parsed);
  console.log('Number of exercises:', parsed.length);
}

// Check current user session
const sessionData = localStorage.getItem('exercise_app_session');
console.log('Current session:', sessionData);

if (sessionData) {
  const session = JSON.parse(sessionData);
  console.log('User ID:', session.user?.id);
}

// Test adding a new exercise
async function testAddExercise() {
  console.log('=== Testing Add Exercise ===');
  
  // Simulate the exercise service
  const exerciseData = {
    type: 'HIIT',
    name: 'Test HIIT Workout',
    duration: 30,
    intensity: 'HIGH',
    date: new Date().toISOString(),
    notes: 'Test exercise from console',
    typeSpecificData: {
      rounds: 4,
      workInterval: 45,
      restInterval: 15
    }
  };
  
  console.log('Creating exercise:', exerciseData);
  
  // We'll need to access the actual exercise service
  // For now, just show what the data would look like
  console.log('Exercise would be created with data:', exerciseData);
}

// Export for easy testing
window.testExerciseFlow = {
  testAddExercise,
  checkData: () => {
    console.log('=== Current Exercise Data ===');
    const exercises = localStorage.getItem('exercises');
    if (exercises) {
      const parsed = JSON.parse(exercises);
      console.table(parsed.map(ex => ({
        name: ex.name,
        type: ex.type,
        duration: ex.duration,
        date: new Date(ex.date).toLocaleDateString()
      })));
    } else {
      console.log('No exercises found in localStorage');
    }
  }
};

console.log('=== Test Functions Available ===');
console.log('- window.testExerciseFlow.checkData() - Check current data');
console.log('- window.testExerciseFlow.testAddExercise() - Test adding exercise');
console.log('=== End Test ===');