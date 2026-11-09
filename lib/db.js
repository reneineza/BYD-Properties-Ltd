import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { DEFAULT_CONTENT, mergeDeep } from './defaultContent';

// Service role client for admin tasks (bypasses RLS)
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('--- SUPABASE ADMIN CLIENT INITIALIZED ---');
} else {
  console.log('--- WARNING: SUPABASE ADMIN FALLING BACK TO ANON CLIENT ---');
}

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : supabase;

// --- Properties ---
export async function getProperties(agentId = null, onlyApproved = false) {
  let query = supabase.from('properties').select('*, agents(name, email)');
  if (agentId) query = query.eq('agent_id', agentId);
  if (onlyApproved) query = query.eq('is_approved', true);
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  return data;
}

export async function getPropertiesByLocation(location, onlyApproved = true) {
  let query = supabase.from('properties').select('*, agents(name, email)');
  
  if (onlyApproved) query = query.eq('is_approved', true);
  
  const { data, error } = await query
    .ilike('location', `%${location}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching properties by location:', error);
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
    .from('properties')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
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

export async function getContent() {
  const { data, error } = await supabaseAdmin
    .from('site_config')
    .select('data')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('Error fetching site content:', error);
    return DEFAULT_CONTENT;
  }
  
  // Deep merge default fallback content with whatever exists in the database
  const merged = mergeDeep(DEFAULT_CONTENT, data.data || {});

  // If the database has empty images, placeholder team, or legacy members, enforce DEFAULT_CONTENT.about.team
  const isLegacy = !merged.about?.team || !Array.isArray(merged.about.team) || merged.about.team.length === 0 || merged.about.team.some(
    (m) => !m.image || m.name?.toLowerCase().includes('khaled') || m.name?.toLowerCase().includes('youssef') || m.name?.toLowerCase().includes('didier') || m.name?.toLowerCase().includes('byishimo')
  );
  if (isLegacy) {
    merged.about = merged.about || {};
    merged.about.team = DEFAULT_CONTENT.about.team;
  }

  return merged;
}

export async function updateContent(contentData) {
  const { data, error } = await supabaseAdmin
    .from('site_config')
    .upsert({ id: 1, data: contentData, updated_at: new Date().toISOString() })
    .select('data')
    .single();

  if (error) {
    console.error('Error updating site content:', error);
    throw error;
  }
  return data.data;
}

// --- Agents ---

const DATA_DIR = path.join(process.cwd(), 'data');

function readLocalJson(filename, defaultValue = []) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return defaultValue;
  }
}

function writeLocalJson(filename, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing local ${filename}:`, err);
  }
}

function normalizePhone(p) {
  if (!p) return '';
  return p.replace(/[^\d+]/g, '');
}

export async function getAgents() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('name');
    
    if (!error && Array.isArray(data)) {
      // Sync local cache
      writeLocalJson('agents.json', data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase getAgents failed, using local fallback:', err.message);
  }

  // Local fallback
  return readLocalJson('agents.json', []);
}

export async function getAgentById(id) {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error && data) return data;
  } catch (err) {
    // Fallback to local
  }

  const agents = readLocalJson('agents.json', []);
  return agents.find((a) => a.id === id) || null;
}

export async function getAgentByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .ilike('email', cleanEmail)
      .single();
    
    if (!error && data) return data;
  } catch (err) {
    // Fallback to local
  }

  const agents = readLocalJson('agents.json', []);
  return agents.find((a) => a.email?.toLowerCase() === cleanEmail) || null;
}

export async function getAgentByPhone(phone) {
  if (!phone) return null;
  const clean = normalizePhone(phone);

  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*');
    
    if (!error && Array.isArray(data)) {
      const match = data.find((a) => {
        const p1 = normalizePhone(a.phone);
        const p2 = normalizePhone(a.phone_number);
        return p1 === clean || p2 === clean || (clean.length > 8 && (p1.endsWith(clean.slice(-8)) || p2.endsWith(clean.slice(-8))));
      });
      if (match) return match;
    }
  } catch (err) {
    // Fallback
  }

  const agents = readLocalJson('agents.json', []);
  return agents.find((a) => {
    const p1 = normalizePhone(a.phone);
    const p2 = normalizePhone(a.phone_number);
    return p1 === clean || p2 === clean || (clean.length > 8 && (p1.endsWith(clean.slice(-8)) || p2.endsWith(clean.slice(-8))));
  }) || null;
}

export async function getAgentByEmailOrPhone(identifier) {
  if (!identifier) return null;
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return await getAgentByEmail(trimmed);
  }
  return await getAgentByPhone(trimmed);
}

export async function createAgent(agentData) {
  const normalized = {
    id: agentData.id || crypto.randomUUID(),
    name: agentData.name || agentData.full_name || '',
    full_name: agentData.full_name || agentData.name || '',
    email: agentData.email?.toLowerCase().trim(),
    phone: agentData.phone || agentData.phone_number || '',
    phone_number: agentData.phone_number || agentData.phone || '',
    whatsapp_number: agentData.whatsapp_number || '',
    agency_name: agentData.agency_name || '',
    location: agentData.location || '',
    password: agentData.password || '',
    photo_url: agentData.photo_url || agentData.profile_image || null,
    profile_image: agentData.profile_image || agentData.photo_url || null,
    specialization: agentData.specialization || '',
    bio: agentData.bio || '',
    experience: agentData.experience || '',
    email_verified_at: agentData.email_verified_at || null,
    status: agentData.status || agentData.account_status || 'email_pending',
    account_status: agentData.account_status || agentData.status || 'email_pending',
    rejection_reason: agentData.rejection_reason || null,
    approved_at: agentData.approved_at || null,
    approved_by: agentData.approved_by || null,
    created_at: agentData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .insert([normalized])
      .select()
      .single();
    
    if (!error && data) {
      // update local
      const local = readLocalJson('agents.json', []);
      writeLocalJson('agents.json', [...local.filter(a => a.id !== data.id), data]);
      return data;
    }
    if (error) {
      // If uniqueness violation, rethrow for API handler
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('key')) {
        throw error;
      }
      console.warn('Supabase createAgent failed, saving locally:', error.message);
    }
  } catch (err) {
    if (err.code === '23505' || err.message?.includes('unique')) throw err;
    console.warn('createAgent fallback to local store:', err.message);
  }

  // Local fallback
  const local = readLocalJson('agents.json', []);
  if (local.some(a => a.email === normalized.email)) {
    const err = new Error('An agent with this email address already exists');
    err.code = '23505';
    throw err;
  }
  local.push(normalized);
  writeLocalJson('agents.json', local);
  return normalized;
}

export async function updateAgent(id, agentData) {
  const updates = {
    ...agentData,
    updated_at: new Date().toISOString(),
  };

  if (agentData.name && !agentData.full_name) updates.full_name = agentData.name;
  if (agentData.full_name && !agentData.name) updates.name = agentData.full_name;
  if (agentData.phone && !agentData.phone_number) updates.phone_number = agentData.phone;
  if (agentData.phone_number && !agentData.phone) updates.phone = agentData.phone_number;
  if (agentData.photo_url && !agentData.profile_image) updates.profile_image = agentData.photo_url;
  if (agentData.profile_image && !agentData.photo_url) updates.photo_url = agentData.profile_image;
  if (agentData.status && !agentData.account_status) updates.account_status = agentData.status;
  if (agentData.account_status && !agentData.status) updates.status = agentData.account_status;

  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (!error && data) {
      const local = readLocalJson('agents.json', []);
      writeLocalJson('agents.json', local.map(a => (a.id === id ? { ...a, ...data } : a)));
      return data;
    }
  } catch (err) {
    console.warn('updateAgent fallback to local:', err.message);
  }

  // Local update
  const local = readLocalJson('agents.json', []);
  const index = local.findIndex((a) => a.id === id);
  if (index === -1) return null;
  local[index] = { ...local[index], ...updates };
  writeLocalJson('agents.json', local);
  return local[index];
}

export async function deleteAgent(id) {
  try {
    await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('deleteAgent fallback:', err.message);
  }

  const local = readLocalJson('agents.json', []);
  writeLocalJson('agents.json', local.filter((a) => a.id !== id));
  return true;
}

export async function updateAgentPassword(id, passwordHash) {
  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .update({ password: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
      .single();
    
    if (!error && data) {
      const local = readLocalJson('agents.json', []);
      writeLocalJson('agents.json', local.map(a => (a.id === id ? { ...a, password: passwordHash } : a)));
      return true;
    }
  } catch (err) {
    console.warn('updateAgentPassword fallback:', err.message);
  }

  const local = readLocalJson('agents.json', []);
  const agent = local.find(a => a.id === id);
  if (agent) {
    agent.password = passwordHash;
    writeLocalJson('agents.json', local);
    return true;
  }
  return false;
}

// --- OTP Verifications ---

export async function createOtpRecord({ userId = null, email, otpHash, expiresAt }) {
  const record = {
    id: crypto.randomUUID(),
    user_id: userId,
    email: email.toLowerCase().trim(),
    otp_hash: otpHash,
    expires_at: expiresAt,
    verified_at: null,
    attempts: 0,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .insert([record])
      .select()
      .single();
    
    if (!error && data) {
      const local = readLocalJson('otps.json', []);
      writeLocalJson('otps.json', [...local, data]);
      return data;
    }
  } catch (err) {
    console.warn('createOtpRecord fallback to local:', err.message);
  }

  const local = readLocalJson('otps.json', []);
  local.push(record);
  writeLocalJson('otps.json', local);
  return record;
}

export async function getRecentOtpRecord(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  try {
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', cleanEmail)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!error && data) return data;
  } catch (err) {
    // Fallback
  }

  const local = readLocalJson('otps.json', []);
  const records = local
    .filter((o) => o.email === cleanEmail && !o.verified_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return records[0] || null;
}

export async function getOtpRequestsInWindow(email, windowMinutes = 10) {
  if (!email) return 0;
  const cleanEmail = email.toLowerCase().trim();
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('id')
      .eq('email', cleanEmail)
      .gte('created_at', since);
    
    if (!error && Array.isArray(data)) return data.length;
  } catch (err) {
    // Fallback
  }

  const local = readLocalJson('otps.json', []);
  return local.filter(
    (o) => o.email === cleanEmail && new Date(o.created_at) >= new Date(since)
  ).length;
}

export async function incrementOtpAttempts(id) {
  try {
    const { data: current } = await supabaseAdmin
      .from('otp_verifications')
      .select('attempts')
      .eq('id', id)
      .single();
    
    const attempts = (current?.attempts || 0) + 1;
    await supabaseAdmin
      .from('otp_verifications')
      .update({ attempts })
      .eq('id', id);
  } catch (err) {
    // Fallback
  }

  const local = readLocalJson('otps.json', []);
  const rec = local.find((o) => o.id === id);
  if (rec) {
    rec.attempts = (rec.attempts || 0) + 1;
    writeLocalJson('otps.json', local);
    return rec.attempts;
  }
  return 1;
}

export async function markOtpVerified(id) {
  const verifiedAt = new Date().toISOString();
  try {
    await supabaseAdmin
      .from('otp_verifications')
      .update({ verified_at: verifiedAt })
      .eq('id', id);
  } catch (err) {
    // Fallback
  }

  const local = readLocalJson('otps.json', []);
  const rec = local.find((o) => o.id === id);
  if (rec) {
    rec.verified_at = verifiedAt;
    writeLocalJson('otps.json', local);
  }
  return true;
}

// --- Page Views ---
export async function getPageViews() {
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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

// --- Subscriptions ---

export async function getSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active');
  
  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
  return data;
}

export async function createSubscription(email) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ email }]);
  
  if (error) {
    if (error.code === '23505') return { error: 'You are already subscribed!' };
    console.error('Error creating subscription:', error);
    throw error;
  }
  return data;
}

// --- WhatsApp CRM ---

export async function getWhatsAppLeads(agentId = null) {
  let query = supabase.from('whatsapp_leads').select('*, properties(*)');
  
  if (agentId) {
    const { data: props } = await supabase.from('properties').select('id').eq('agent_id', agentId);
    const propertyIds = props?.map(p => p.id) || [];
    query = query.in('property_id', propertyIds);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
  return data;
}

export async function createWhatsAppLead(leadData) {
  const { data, error } = await supabase
    .from('whatsapp_leads')
    .insert([leadData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
  return data;
}
