import Database from 'better-sqlite3';
import path from 'path';
import { HealthGoalId, UserGoalPreference } from '@/lib/types/healthGoals';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'exercise-app.db');
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');
    
    // Initialize tables
    initializeTables();
  }
  
  return db;
}

function initializeTables() {
  if (!db) return;
  
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create user_goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      goal_id TEXT NOT NULL,
      selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(user_id, goal_id, is_active)
    )
  `);
  
  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals (user_id);
    CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals (user_id, is_active);
  `);
}

export async function saveUserGoalPreference(
  userId: string,
  goalData: { goalId: HealthGoalId; selectedAt: Date; isActive: boolean }
): Promise<void> {
  const database = getDatabase();
  
  try {
    // Start a transaction
    const transaction = database.transaction(() => {
      // Deactivate all previous goals for this user
      const deactivateStmt = database.prepare(`
        UPDATE user_goals 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND is_active = 1
      `);
      deactivateStmt.run(userId);
      
      // Insert new goal preference
      const insertStmt = database.prepare(`
        INSERT INTO user_goals (user_id, goal_id, selected_at, is_active)
        VALUES (?, ?, ?, ?)
      `);
      insertStmt.run(
        userId,
        goalData.goalId,
        goalData.selectedAt.toISOString(),
        goalData.isActive ? 1 : 0
      );
    });
    
    transaction();
  } catch (error) {
    console.error('Error saving user goal preference:', error);
    throw new Error('Failed to save goal preference');
  }
}

export async function getUserGoalPreference(userId: string): Promise<UserGoalPreference | null> {
  const database = getDatabase();
  
  try {
    const stmt = database.prepare(`
      SELECT user_id, goal_id, selected_at, is_active
      FROM user_goals
      WHERE user_id = ? AND is_active = 1
      ORDER BY selected_at DESC
      LIMIT 1
    `);
    
    const row = stmt.get(userId) as any;
    
    if (!row) return null;
    
    return {
      userId: row.user_id,
      goalId: row.goal_id as HealthGoalId,
      selectedAt: new Date(row.selected_at),
      isActive: Boolean(row.is_active)
    };
  } catch (error) {
    console.error('Error getting user goal preference:', error);
    throw new Error('Failed to get goal preference');
  }
}

export async function getUserGoalHistory(userId: string): Promise<UserGoalPreference[]> {
  const database = getDatabase();
  
  try {
    const stmt = database.prepare(`
      SELECT user_id, goal_id, selected_at, is_active
      FROM user_goals
      WHERE user_id = ?
      ORDER BY selected_at DESC
    `);
    
    const rows = stmt.all(userId) as any[];
    
    return rows.map(row => ({
      userId: row.user_id,
      goalId: row.goal_id as HealthGoalId,
      selectedAt: new Date(row.selected_at),
      isActive: Boolean(row.is_active)
    }));
  } catch (error) {
    console.error('Error getting user goal history:', error);
    throw new Error('Failed to get goal history');
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Initialize database directory
export function ensureDatabaseDirectory() {
  const fs = require('fs');
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}