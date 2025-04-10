// Use environment variable for API URL if available, otherwise use relative URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('Using API URL:', API_BASE);

async function handleResponse(response: Response) {
  if (!response.ok) {
    console.error('API Error:', {
      status: response.status,
      url: response.url,
      statusText: response.statusText
    });
    const error = await response.json().catch(() => ({ 
      error: `HTTP error! status: ${response.status}`,
      status: response.status
    }));
    throw new Error(error.error || `Failed to fetch data (${response.status})`);
  }
  return response.json();
}

export async function proxyRequest(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error in proxy request to ${path}:`, error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchUserStats(walletAddress: string) {
  try {
    console.log('Fetching user stats with wallet:', walletAddress);
    const response = await fetch(`/api/users/${walletAddress}/stats`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user stats');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch user stats');
  }
}

export async function startMatch(agent1Id: string, agent2Id: string) {
  try {
    const response = await fetch(`${API_BASE}/competitions/chess/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent1Id,
        agent2Id
      })
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error starting match:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchEngineStatus() {
  try {
    const response = await fetch(`${API_BASE}/competitions/chess/status`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching engine status:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchUserAgents(wallet: string) {
  try {
    const response = await fetch(`${API_BASE}/competitions/chess/agents/${wallet}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching user agents:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function uploadAgent(file: File, wallet: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('wallet', wallet);

    const response = await fetch(`${API_BASE}/upload/agent`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error uploading agent:', error);
    throw new Error('Failed to connect to server. Please make sure the server is running.');
  }
}

export async function fetchUser(walletAddress: string) {
  try {
    console.log('Fetching user with wallet:', walletAddress);
    const response = await fetch(`/api/users/${walletAddress}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch user');
  }
}

export async function fetchTodos() {
  try {
    const response = await fetch(`${API_BASE}/todos`);
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos. Please make sure the server is running.');
  }
}

export async function createTodo(title: string) {
  try {
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo. Please make sure the server is running.');
  }
}

export async function updateTodo(id: string, updates: { title?: string; completed?: boolean }) {
  try {
    const response = await fetch(`${API_BASE}/todos`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw new Error('Failed to update todo. Please make sure the server is running.');
  }
}

export async function deleteTodo(id: string) {
  try {
    const response = await fetch(`${API_BASE}/todos?id=${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw new Error('Failed to delete todo. Please make sure the server is running.');
  }
} 