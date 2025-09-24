#![no_main]

use risc0_zkvm::guest::env;
use serde::{Deserialize, Serialize};

// Game session data structure
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, Hash)]
pub struct GameSession {
    pub player_address: [u8; 20], // Ethereum address as bytes
    pub start_timestamp: u64,     // Unix timestamp when game started
    pub end_timestamp: u64,       // Unix timestamp when game ended
    pub blocks_destroyed: u32,    // Total blocks destroyed in session
    pub decisions_made: Vec<u8>,  // Decision IDs made during session
    pub final_soul_tokens: u64,   // Final soul token balance
    pub total_clicks: u32,        // Total clicks made
    pub version: u8,              // Circuit version for future compatibility
}

// Game verification output
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct VerificationResult {
    pub player_address: [u8; 20],
    pub tokens_earned: u64,
    pub session_hash: [u8; 32],
    pub is_valid: bool,
}

risc0_zkvm::guest::entry!(main);

pub fn main() {
    // Read the game session data from the host
    let session: GameSession = env::read();

    // Calculate session duration
    let session_duration = session.end_timestamp - session.start_timestamp;

    // Basic invariant checks
    let is_valid = verify_game_session(&session, session_duration);

    // Create verification result
    let result = VerificationResult {
        player_address: session.player_address,
        tokens_earned: if is_valid {
            session.final_soul_tokens
        } else {
            0
        },
        session_hash: calculate_session_hash(&session),
        is_valid,
    };

    // Commit the result to the journal
    env::commit(&result);
}

fn verify_game_session(session: &GameSession, duration_seconds: u64) -> bool {
    // Version compatibility check
    if session.version != 1 {
        return false;
    }

    // Basic time bounds
    if duration_seconds < 10 || duration_seconds > 3600 {
        return false; // 10 seconds minimum, 1 hour maximum
    }

    // Reasonable token earning bounds
    let max_possible_tokens = calculate_max_possible_tokens(session);
    if session.final_soul_tokens > max_possible_tokens {
        return false;
    }

    // Click rate sanity check (max 10 clicks per second)
    let max_clicks = duration_seconds * 10;
    if session.total_clicks as u64 > max_clicks {
        return false;
    }

    // Decision count bounds
    if session.decisions_made.len() > 25 {
        return false; // Maximum 25 decisions per session
    }

    // Decision ID bounds (assuming you have max 50 unique decision IDs)
    for &decision_id in &session.decisions_made {
        if decision_id > 50 {
            return false;
        }
    }

    // Blocks destroyed should correlate with time and clicks
    let min_blocks = session.total_clicks / 10; // At least 1 block per 10 clicks
    let max_blocks = session.total_clicks * 2; // At most 2 blocks per click

    if session.blocks_destroyed < min_blocks || session.blocks_destroyed > max_blocks {
        return false;
    }

    true
}

fn calculate_max_possible_tokens(session: &GameSession) -> u64 {
    // Base tokens: 1 per block destroyed
    let base_tokens = session.blocks_destroyed as u64;

    // Decision multipliers (simplified)
    let decision_bonus = session.decisions_made.len() as u64 * 10; // 10 tokens per decision

    // Time bonus (longer sessions get slight bonus, but capped)
    let duration = session.end_timestamp - session.start_timestamp;
    let time_bonus = std::cmp::min(duration / 60, 60); // Max 1 token per minute, capped at 60

    base_tokens + decision_bonus + time_bonus
}

fn calculate_session_hash(session: &GameSession) -> [u8; 32] {
    // Simple hash using built-in hash function
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();

    // Hash key session parameters
    session.player_address.hash(&mut hasher);
    session.start_timestamp.hash(&mut hasher);
    session.end_timestamp.hash(&mut hasher);
    session.blocks_destroyed.hash(&mut hasher);
    session.final_soul_tokens.hash(&mut hasher);
    session.decisions_made.hash(&mut hasher);
    session.total_clicks.hash(&mut hasher);
    session.version.hash(&mut hasher);

    let hash_value = hasher.finish();

    // Convert u64 hash to [u8; 32] by repeating and padding
    let mut result = [0u8; 32];
    let bytes = hash_value.to_le_bytes();
    for (i, &byte) in bytes.iter().cycle().take(32).enumerate() {
        result[i] = byte;
    }
    result
}
