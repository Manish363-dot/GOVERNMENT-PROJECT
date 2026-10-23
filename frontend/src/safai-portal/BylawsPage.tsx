import { useSearchParams } from 'react-router-dom';
import { CleanlinessBylawsPage } from '@/safai-portal/CleanlinessBylawsPage';
import { SwmRulesPage } from '@/safai-portal/SwmRulesPage';

export function BylawsPage() {
  const [searchParams] = useSearchParams();
  const docParam = (searchParams.get('doc') || '').toLowerCase();

  if (docParam.includes('rule') || docParam.includes('2026') || docParam.includes('swm-rules')) {
    return <SwmRulesPage />;
  }

  return <CleanlinessBylawsPage />;
}

export default BylawsPage;
