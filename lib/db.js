import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function readJSON(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Properties ---
export function getProperties() {
  return readJSON('properties.json');
}

export function getPropertyById(id) {
  return getProperties().find((p) => p.id === id) || null;
}

export function createProperty(data) {
  const properties = getProperties();
  const newProp = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  properties.push(newProp);
  writeJSON('properties.json', properties);
  return newProp;
}

export function updateProperty(id, data) {
  const properties = getProperties();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  properties[idx] = { ...properties[idx], ...data, updatedAt: new Date().toISOString() };
  writeJSON('properties.json', properties);
  return properties[idx];
}

export function deleteProperty(id) {
  const properties = getProperties();
  const filtered = properties.filter((p) => p.id !== id);
  if (filtered.length === properties.length) return false;
  writeJSON('properties.json', filtered);
  return true;
}

// --- Inquiries ---
export function getInquiries() {
  return readJSON('inquiries.json');
}

export function createInquiry(data) {
  const inquiries = getInquiries();
  const newInq = {
    ...data,
    id: crypto.randomUUID(),
    read: false,
    responded: false,
    createdAt: new Date().toISOString(),
  };
  inquiries.push(newInq);
  writeJSON('inquiries.json', inquiries);
  return newInq;
}

export function updateInquiry(id, data) {
  const inquiries = getInquiries();
  const idx = inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  inquiries[idx] = { ...inquiries[idx], ...data };
  writeJSON('inquiries.json', inquiries);
  return inquiries[idx];
}

// --- Content ---
export function getContent() {
  const filePath = path.join(dataDir, 'content.json');
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function updateContent(data) {
  const current = getContent();
  const updated = { ...current, ...data };
  writeJSON('content.json', updated);
  return updated;
}

// --- Agents ---
export function getAgents() {
  return readJSON('agents.json');
}

export function createAgent(data) {
  const agents = getAgents();
  const exists = agents.find((a) => a.email === data.email);
  if (exists) throw new Error('Email already registered');
  const newAgent = {
    ...data,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  agents.push(newAgent);
  writeJSON('agents.json', agents);
  return newAgent;
}

export function updateAgent(id, data) {
  const agents = getAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  agents[idx] = { ...agents[idx], ...data };
  writeJSON('agents.json', agents);
  return agents[idx];
}

export function deleteAgent(id) {
  const agents = getAgents();
  const filtered = agents.filter((a) => a.id !== id);
  writeJSON('agents.json', filtered);
  return true;
}

// --- Page Views ---
export function getPageViews() {
  return readJSON('pageviews.json');
}

export function logPageView({ path, sessionId, referrer }) {
  const views = getPageViews();
  views.push({
    id: crypto.randomUUID(),
    path: path || '/',
    sessionId: sessionId || null,
    referrer: referrer || null,
    timestamp: new Date().toISOString(),
  });
  writeJSON('pageviews.json', views);
}
