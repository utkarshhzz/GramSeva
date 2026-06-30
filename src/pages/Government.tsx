
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GovernmentScheme from '@/components/GovernmentScheme';
import { Search, TrendingUp, Shield, CreditCard, Leaf, Building2, BarChart3 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Government = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [realSchemes, setRealSchemes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  React.useEffect(() => {
    fetch('/myschemes_scraped.json')
      .then(res => res.json())
      .then(data => {
        setRealSchemes(data);
      })
      .catch(console.error);
  }, []);

  const schemes = [
    {
      title: "PM-KISAN",
      description: "प्रधानमंत्री किसान सम्मान निधि योजना",
      englishDescription: "Prime Minister's Farmer's Respect Fund Scheme",
      benefits: "₹6,000 per year direct income support in 3 equal installments",
      eligibility: "All small and marginal farmers with cultivable land",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://pmkisan.gov.in/",
      category: "financial",
      icon: TrendingUp,
      color: "bg-transparent",
      popular: true
    },
    {
      title: "PMFBY",
      description: "प्रधानमंत्री फसल बीमा योजना",
      englishDescription: "Prime Minister's Crop Insurance Scheme",
      benefits: "Insurance coverage for crop damage due to natural calamities, pests & diseases",
      eligibility: "All farmers growing notified crops in notified areas",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://pmfby.gov.in/",
      category: "insurance",
      icon: Shield,
      color: "bg-transparent",
      popular: true
    },
    {
      title: "KCC",
      description: "किसान क्रेडिट कार्ड",
      englishDescription: "Kisan Credit Card",
      benefits: "Short-term credit support at minimal interest rate of 4% per annum",
      eligibility: "All farmers, tenant farmers, oral lessees, and sharecroppers",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://www.nabard.org/content.aspx?id=582",
      category: "credit",
      icon: CreditCard,
      color: "bg-transparent",
      popular: true
    },
    {
      title: "PKVY",
      description: "परम्परागत कृषि विकास योजना",
      englishDescription: "Paramparagat Krishi Vikas Yojana",
      benefits: "₹50,000 per hectare for 3 years for organic farming adoption",
      eligibility: "Farmers willing to adopt organic farming in clusters",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://pgsindia-ncof.gov.in/pkvy/Index.aspx",
      category: "organic",
      icon: Leaf,
      color: "bg-transparent"
    },
    {
      title: "RKVY",
      description: "राष्ट्रीय कृषि विकास योजना",
      englishDescription: "Rashtriya Krishi Vikas Yojana",
      benefits: "Infrastructure development, modern farming technology & equipment support",
      eligibility: "State governments for farmer groups and cooperatives",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://rkvy.nic.in/",
      category: "infrastructure",
      icon: Building2,
      color: "bg-transparent"
    },
    {
      title: "AGMARKNET",
      description: "कृषि विपणन सूचना नेटवर्क",
      englishDescription: "Agricultural Marketing Information Network",
      benefits: "Real-time agricultural commodity prices from 3000+ mandis across India",
      eligibility: "All farmers with internet access",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://agmarknet.gov.in/",
      category: "market",
      icon: BarChart3,
      color: "bg-transparent"
    },
    {
      title: "Soil Health Card",
      description: "मृदा स्वास्थ्य कार्ड योजना",
      englishDescription: "Soil Health Card Scheme",
      benefits: "Free soil testing and customized fertilizer recommendations",
      eligibility: "All farmers across India",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://soilhealth.dac.gov.in/",
      category: "infrastructure",
      icon: Leaf,
      color: "bg-transparent"
    },
    {
      title: "e-NAM",
      description: "राष्ट्रीय कृषि बाज़ार",
      englishDescription: "National Agriculture Market",
      benefits: "Online trading platform for better price discovery and transparency",
      eligibility: "Farmers registered with APMC mandis",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
      link: "https://www.enam.gov.in/",
      category: "market",
      icon: BarChart3,
      color: "bg-transparent"
    }
  ];

  const filteredSchemes = React.useMemo(() => {
    const combined = [...schemes];
    if (realSchemes.length > 0) {
      combined.push(...realSchemes.map((rs, idx) => ({
        title: rs.scheme_name || `Scheme ${idx}`,
        description: rs.details?.replace('Details\n', '').substring(0, 100) + '...' || '',
        englishDescription: '',
        benefits: rs.benefits?.replace('Benefits\n', '') || '',
        eligibility: rs.eligibility?.replace('Eligibility\n', '') || '',
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg",
        link: rs.scheme_link !== 'NaN' ? rs.scheme_link : '#',
        category: "financial", // fallback
        icon: Building2,
        color: "bg-transparent",
        popular: false
      })));
    }

    return combined.filter(scheme => {
      const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (scheme.englishDescription && scheme.englishDescription.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [schemes, realSchemes, searchTerm, selectedCategory]);

  const displayedSchemes = React.useMemo(() => {
    return filteredSchemes.slice(0, page * itemsPerPage);
  }, [filteredSchemes, page]);

  const categories = [
    { id: 'all', label: 'All Schemes', labelHi: 'सभी योजनाएँ' },
    { id: 'financial', label: 'Financial Support', labelHi: 'वित्तीय सहायता' },
    { id: 'insurance', label: 'Insurance', labelHi: 'बीमा' },
    { id: 'credit', label: 'Credit & Loans', labelHi: 'ऋण' },
    { id: 'organic', label: 'Organic Farming', labelHi: 'जैविक खेती' },
    { id: 'infrastructure', label: 'Infrastructure', labelHi: 'बुनियादी ढांचा' },
    { id: 'market', label: 'Market Access', labelHi: 'बाज़ार पहुँच' }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isHighContrast ? 'high-contrast' : ''}`}>
      <Header />
      
      <main className="flex-grow bg-background">
        {/* Hero Section */}
        <div className="bg-card border-b border-white/5 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                  <Building2 className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                सरकारी योजनाएँ
              </h1>
              <p className="text-xl md:text-2xl mb-2 font-medium">
                Government Schemes for Farmers
              </p>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Explore and apply for various government schemes designed to support and empower farmers across India
              </p>
              
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  className="pl-12 pr-4 py-6 text-lg bg-background/50 border border-white/10 shadow-xl text-white"
                  placeholder="खोजें योजना... (Search for schemes...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl shadow-md border border-white/10 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{realSchemes.length > 0 ? (realSchemes.length + schemes.length) : schemes.length}+</div>
              <div className="text-white/60">Active Schemes</div>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md border border-white/10 text-center">
              <div className="text-3xl font-bold text-primary mb-2">₹50K+</div>
              <div className="text-white/60">Max Benefits/Year</div>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md border border-white/10 text-center">
              <div className="text-3xl font-bold text-primary mb-2">10M+</div>
              <div className="text-white/60">Farmers Benefited</div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-black hover:brightness-110'
                      : 'border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.labelHi} / {category.label}
                </Badge>
              ))}
            </div>
          </div>
          {/* Popular Schemes */}
          {selectedCategory === 'all' && searchTerm === '' && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                लोकप्रिय योजनाएँ / Popular Schemes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.filter(s => s.popular).map((scheme, index) => (
                  <GovernmentScheme
                    key={index}
                    title={scheme.title}
                    description={scheme.description}
                    englishDescription={scheme.englishDescription}
                    benefits={scheme.benefits}
                    eligibility={scheme.eligibility}
                    logo={scheme.logo}
                    link={scheme.link}
                    icon={scheme.icon}
                    color={scheme.color}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* All Schemes */}
          <div className="mb-12">
            {selectedCategory === 'all' && searchTerm === '' && (
              <h2 className="text-2xl font-bold text-white mb-6">
                सभी योजनाएँ / All Schemes
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSchemes.map((scheme, index) => (
                <GovernmentScheme
                  key={index}
                  title={scheme.title}
                  description={scheme.description}
                  englishDescription={scheme.englishDescription}
                  benefits={scheme.benefits}
                  eligibility={scheme.eligibility}
                  logo={scheme.logo}
                  link={scheme.link}
                  icon={scheme.icon}
                  color={scheme.color}
                />
              ))}
            </div>
            
            {displayedSchemes.length < filteredSchemes.length && (
              <div className="flex justify-center mt-8">
                <Button onClick={() => setPage(p => p + 1)} variant="outline" className="px-8">
                  Load More Schemes
                </Button>
              </div>
            )}
          </div>
          
          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60">
                कोई योजना नहीं मिली। कृपया अपनी खोज बदलें।
              </p>
              <p className="text-white/60">
                No schemes found. Please try a different search.
              </p>
            </div>
          )}

          {/* Government Partners Section */}
          <div className="mt-16 max-w-6xl mx-auto bg-card p-8 rounded-2xl shadow-xl border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                हमारे सरकारी साझेदार
              </h2>
              <p className="text-lg text-white/60">
                Our Government Partners
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: 'NABARD', logo: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg' },
                { name: 'Ministry of Agriculture', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg' },
                { name: 'PM-KISAN', logo: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg' },
                { name: 'ICAR', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg' },
                { name: 'APEDA', logo: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg' },
                { name: 'NHB', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg' }
              ].map((partner, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-center p-6 bg-background rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-white/5"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-16 w-16 object-contain mb-3 opacity-80 hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg";
                    }}
                  />
                  <p className="text-xs font-medium text-white/70 text-center">
                    {partner.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 max-w-4xl mx-auto bg-card border border-primary/20 text-white p-8 rounded-2xl shadow-[0_0_30px_rgba(196,168,124,0.1)]">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3 text-primary">Need Help Applying?</h3>
              <p className="text-white/70 mb-6">
                Our team is here to assist you with scheme applications and documentation
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary text-black hover:brightness-110 font-semibold"
                >
                  Contact Support
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-black font-semibold"
                >
                  View Guidelines
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Government;
