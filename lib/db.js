import { supabase } from './supabase';

// --- Properties ---
export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  return data;
}

export async function getPropertyById(id) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }
  return data;
}

export async function createProperty(propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert([propertyData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating property:', error);
    throw error;
  }
  return data;
}

export async function updateProperty(id, propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .update({ ...propertyData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating property:', error);
    throw error;
  }
  return data;
}

export async function deleteProperty(id) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting property:', error);
    return false;
  }
  return true;
}

// --- Inquiries ---
export async function getInquiries() {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
  return data;
}

export async function createInquiry(inquiryData) {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiryData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
  return data;
}

export async function updateInquiry(id, inquiryData) {
  const { data, error } = await supabase
    .from('inquiries')
    .update(inquiryData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
  return data;
}

// --- Content ---
// For now, we'll keep content as JSON or we can move it to a 'content' table later.
// To keep it simple, I'll mock it for now or keep it local.
export async function getContent() {
  // In a real app, you might have a 'site_config' table.
  // For now, let's keep it local or create a simple table.
  return {}; 
}

export async function updateContent(data) {
  return data;
}

// --- Agents ---
export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
  return data;
}

export async function createAgent(agentData) {
  const { data, error } = await supabase
    .from('agents')
    .insert([agentData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
  return data;
}

export async function updateAgent(id, agentData) {
  const { data, error } = await supabase
    .from('agents')
    .update(agentData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
  return data;
}

export async function deleteAgent(id) {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting agent:', error);
    return false;
  }
  return true;
}

// --- Page Views ---
export async function getPageViews() {
  const { data, error } = await supabase
    .from('pageviews')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching pageviews:', error);
    return [];
  }
  return data;
}

export async function logPageView({ path, sessionId, referrer }) {
  const { error } = await supabase
    .from('pageviews')
    .insert([{ 
      path: path || '/', 
      session_id: sessionId || null, 
      referrer: referrer || null 
    }]);
  
  if (error) {
    console.error('Error logging pageview:', error);
  }
}
