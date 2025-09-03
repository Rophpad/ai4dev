import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface UrlStateConfig {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export function useUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current state from URL
  const getUrlState = useCallback((): UrlStateConfig => {
    return {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 12,
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'all',
      sort: searchParams.get('sort') || 'newest',
    };
  }, [searchParams]);

  // Update URL with new state
  const updateUrlState = useCallback((newState: Partial<UrlStateConfig>) => {
    const current = getUrlState();
    const updated = { ...current, ...newState };
    
    const params = new URLSearchParams();
    
    if (updated.page && updated.page > 1) params.set('page', updated.page.toString());
    if (updated.pageSize && updated.pageSize !== 12) params.set('pageSize', updated.pageSize.toString());
    if (updated.search) params.set('search', updated.search);
    if (updated.status && updated.status !== 'all') params.set('status', updated.status);
    if (updated.sort && updated.sort !== 'newest') params.set('sort', updated.sort);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    
    router.push(newUrl, { scroll: false });
  }, [getUrlState, router]);

  return {
    getUrlState,
    updateUrlState,
  };
}
