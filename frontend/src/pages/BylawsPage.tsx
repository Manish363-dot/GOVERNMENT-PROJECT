import { useSearchParams } from 'react-router-dom';
import { CleanlinessBylawsPage } from './CleanlinessBylawsPage';
import { SwmRulesPage } from './SwmRulesPage';

export function BylawsPage() {
  const [searchParams] = useSearchParams();
  const docParam = (searchParams.get('doc') || '').toLowerCase();

  if (docParam.includes('rule') || docParam.includes('2026') || docParam.includes('swm-rules')) {
    return <SwmRulesPage />;
  }

  return <CleanlinessBylawsPage />;
}
