// Utility functions for managing demo votes in localStorage
// These can be used in browser console for debugging or administration

/**
 * Get all demo vote data for a poll
 */
export function viewDemoVotes(pollId: string) {
  const demoKey = `demo_votes_${pollId}`;
  const userKey = `user_demo_vote_${pollId}`;
  
  const demoData = localStorage.getItem(demoKey);
  const userData = localStorage.getItem(userKey);
  
  console.log('Demo Votes Data:', demoData ? JSON.parse(demoData) : null);
  console.log('User Demo Vote:', userData ? JSON.parse(userData) : null);
  
  return {
    demoData: demoData ? JSON.parse(demoData) : null,
    userData: userData ? JSON.parse(userData) : null,
  };
}

/**
 * Clear all demo votes for a poll (admin use)
 */
export function clearAllDemoVotes(pollId: string) {
  const demoKey = `demo_votes_${pollId}`;
  const userKey = `user_demo_vote_${pollId}`;
  
  localStorage.removeItem(demoKey);
  localStorage.removeItem(userKey);
  
  console.log(`Cleared all demo votes for poll: ${pollId}`);
}

/**
 * List all polls with demo votes
 */
export function listAllDemoVotes() {
  const demoPolls: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('demo_votes_')) {
      const pollId = key.replace('demo_votes_', '');
      const data = localStorage.getItem(key);
      demoPolls[pollId] = data ? JSON.parse(data) : null;
    }
  }
  
  console.log('All Demo Votes:', demoPolls);
  return demoPolls;
}

/**
 * Get total demo votes across all polls
 */
export function getTotalDemoVotesStats() {
  let totalPolls = 0;
  let totalDemoVotes = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('demo_votes_')) {
      totalPolls++;
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        totalDemoVotes += parsed.totalDemoVotes || 0;
      }
    }
  }
  
  const stats = {
    totalPolls,
    totalDemoVotes,
    averageVotesPerPoll: totalPolls > 0 ? Math.round(totalDemoVotes / totalPolls) : 0,
  };
  
  console.log('Demo Votes Statistics:', stats);
  return stats;
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).demoVoteUtils = {
    viewDemoVotes,
    clearAllDemoVotes,
    listAllDemoVotes,
    getTotalDemoVotesStats,
  };
  
  console.log('Demo vote utilities available at: window.demoVoteUtils');
}
