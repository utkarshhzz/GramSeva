import React, { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Scheme {
  sr_no: string;
  scheme_name: string;
  scheme_link: string;
  details: string;
  benefits: string;
  eligibility: string;
  application_process: string;
  documents_required: string;
}

export function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch('/myschemes_scraped.json')
      .then(res => res.json())
      .then(data => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading schemes:', err);
        setLoading(false);
      });
  }, []);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => 
      s.scheme_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.details?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schemes, searchQuery]);

  const displayedSchemes = useMemo(() => {
    return filteredSchemes.slice(0, page * itemsPerPage);
  }, [filteredSchemes, page]);

  const loadMore = () => setPage(p => p + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Government Schemes Directory</h1>
        <p className="text-xl text-gray-600">
          Discover and apply for {schemes.length > 0 ? schemes.length.toLocaleString() : 'thousands of'} government schemes designed to help citizens and communities.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="relative flex items-center w-full h-14 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-gray-300">
          <div className="grid place-items-center h-full w-12 text-gray-300">
            <Search className="h-6 w-6" />
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
            type="text"
            id="search"
            placeholder="Search by scheme name or keyword (e.g., 'agriculture', 'education')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Showing {filteredSchemes.length} results
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedSchemes.map((scheme) => (
            <div key={scheme.sr_no} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div 
                className="p-6 cursor-pointer flex justify-between items-start"
                onClick={() => setExpandedId(expandedId === scheme.sr_no ? null : scheme.sr_no)}
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{scheme.scheme_name}</h3>
                  <p className="text-gray-600 line-clamp-2">{scheme.details?.replace('Details\n', '')}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {expandedId === scheme.sr_no ? <ChevronUp className="h-6 w-6 text-gray-400" /> : <ChevronDown className="h-6 w-6 text-gray-400" />}
                </div>
              </div>
              
              {expandedId === scheme.sr_no && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-6 bg-gray-50/50">
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <h4 className="text-gray-900 font-semibold mb-2">Benefits</h4>
                    <p className="whitespace-pre-wrap">{scheme.benefits?.replace('Benefits\n', '')}</p>
                    
                    <h4 className="text-gray-900 font-semibold mb-2 mt-4">Eligibility</h4>
                    <p className="whitespace-pre-wrap">{scheme.eligibility?.replace('Eligibility\n', '')}</p>
                    
                    <h4 className="text-gray-900 font-semibold mb-2 mt-4">Application Process</h4>
                    <p className="whitespace-pre-wrap">{scheme.application_process?.replace('Application Process\n', '')}</p>
                    
                    <h4 className="text-gray-900 font-semibold mb-2 mt-4">Documents Required</h4>
                    <p className="whitespace-pre-wrap">{scheme.documents_required?.replace('Documents Required\n', '')}</p>
                  </div>
                  
                  {scheme.scheme_link && scheme.scheme_link !== 'NaN' && (
                    <div className="pt-4">
                      <a 
                        href={scheme.scheme_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Apply / View Official Portal
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {displayedSchemes.length < filteredSchemes.length && (
            <div className="flex justify-center pt-8">
              <Button onClick={loadMore} variant="outline" className="px-8">
                Load More Schemes
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
