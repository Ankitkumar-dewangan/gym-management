import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'GymPilot_tenants_v2';
const DEFAULT_TENANT = {
  id: 'default_gym',
  name: 'My Gym Club',
  plan: 'Starter',
  status: 'active',
  branches: [],
};

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenants, setTenants] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [selectedTenantId, setSelectedTenantId] = useState(() => tenants[0]?.id || 'default_gym');
  const [selectedBranchId, setSelectedBranchId] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
    } catch {}
  }, [tenants]);

  const activeTenant = useMemo(
    () => tenants.find((t) => t.id === selectedTenantId) || tenants[0] || DEFAULT_TENANT,
    [tenants, selectedTenantId]
  );

  const branches = useMemo(() => activeTenant?.branches || [], [activeTenant]);

  const activeBranch = useMemo(() => {
    if (selectedBranchId === 'all') {
      return { id: 'all', name: 'All Branches', city: 'Multi-Branch View' };
    }
    return branches.find((b) => b.id === selectedBranchId) || { id: 'all', name: 'All Branches', city: 'Multi-Branch View' };
  }, [branches, selectedBranchId]);

  const selectTenant = useCallback(
    (tenantId) => {
      setSelectedTenantId(tenantId);
      setSelectedBranchId('all');
      try {
        localStorage.setItem('GymPilot_active_tenant_id', tenantId);
        localStorage.setItem('GymPilot_active_branch_id', 'all');
      } catch {}
    },
    []
  );

  const selectBranch = useCallback((branchId) => {
    setSelectedBranchId(branchId);
    try {
      localStorage.setItem('GymPilot_active_branch_id', branchId);
    } catch {}
  }, []);

  const addTenant = useCallback((newTenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    setSelectedTenantId(newTenant.id);
  }, []);

  const updateActiveTenant = useCallback((updates) => {
    setTenants((prev) => {
      const idx = prev.findIndex((t) => t.id === activeTenant.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updates };
        return next;
      }
      return [{ ...activeTenant, ...updates }, ...prev];
    });
  }, [activeTenant]);

  const value = useMemo(
    () => ({
      tenants,
      setTenants,
      activeTenant,
      branches,
      activeBranch,
      selectedTenantId,
      selectedBranchId,
      selectTenant,
      selectBranch,
      addTenant,
      updateActiveTenant,
    }),
    [
      tenants,
      activeTenant,
      branches,
      activeBranch,
      selectedTenantId,
      selectedBranchId,
      selectTenant,
      selectBranch,
      addTenant,
      updateActiveTenant,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return ctx;
}
