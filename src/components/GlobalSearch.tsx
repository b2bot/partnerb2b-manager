
import { useState, useEffect, useRef } from 'react';
import { Search, X, Megaphone, Target, Users, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMetaData } from '@/hooks/useMetaData';

interface SearchResult {
  id: string;
  name: string;
  type: 'campaign' | 'adset' | 'ad' | 'client';
  status?: string;
  account_id?: string;
  campaign_id?: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { campaigns, adSets, ads } = useMetaData();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    const searchResults: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search campaigns
    campaigns.forEach(campaign => {
      if (campaign.name.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          id: campaign.id,
          name: campaign.name,
          type: 'campaign',
          status: campaign.status,
          account_id: campaign.account_id
        });
      }
    });

    // Search adsets
    adSets.forEach(adset => {
      if (adset.name.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          id: adset.id,
          name: adset.name,
          type: 'adset',
          status: adset.status,
          account_id: adset.account_id,
          campaign_id: adset.campaign_id
        });
      }
    });

    // Search ads
    ads.forEach(ad => {
      if (ad.name.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          id: ad.id,
          name: ad.name,
          type: 'ad',
          status: ad.status,
          account_id: ad.account_id
        });
      }
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsOpen(searchResults.length > 0);
    setIsLoading(false);
  }, [query, campaigns, adSets, ads]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'campaign': return <Megaphone className="w-4 h-4 text-blue-600" />;
      case 'adset': return <Target className="w-4 h-4 text-green-600" />;
      case 'ad': return <Users className="w-4 h-4 text-purple-600" />;
      case 'client': return <Building2 className="w-4 h-4 text-orange-600" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'campaign': return 'Campanha';
      case 'adset': return 'Conjunto';
      case 'ad': return 'Anúncio';
      case 'client': return 'Cliente';
      default: return type;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-700';
      case 'ARCHIVED': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Navigate to:', result);
    // TODO: Implement navigation based on result type
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar campanhas, grupos, anúncios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border border-slate-200 dark:border-slate-700">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500">
                <Search className="w-5 h-5 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {result.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        {result.status && (
                          <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                            {result.status === 'ACTIVE' ? 'Ativo' : 
                             result.status === 'PAUSED' ? 'Pausado' : 'Arquivado'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500">
                <Search className="w-5 h-5 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nenhum resultado encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
