import { useState, useEffect } from "react";

export function useCanViewVoters(pollId: string, pollCreatedBy: string, isAnonymous: boolean = false) {
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (isAnonymous || !pollId) {
        setCanView(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/polls/${pollId}/voters/permissions`);
        const data = await response.json();
        
        setCanView(data.canView || false);
        
      } catch (error) {
        console.error("Error checking voter permissions:", error);
        setCanView(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [pollId, pollCreatedBy, isAnonymous]);

  return { canView, loading };
}
