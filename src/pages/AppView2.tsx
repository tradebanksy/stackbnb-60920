import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Heart, User, Search, Star, Sparkles, Store, ChevronRight, Megaphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { experiences } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import stackdLogo from "@/assets/stackd-logo-new.png";
import heroImage from "@/assets/hero-beach.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";
import MinimalDock from "@/components/ui/minimal-dock";
import { Footerdemo } from "@/components/ui/footer-section";
import kayakingImg from "@/assets/experiences/kayaking.jpg";
import bikesImg from "@/assets/experiences/bikes.jpg";
import snorkelingImg from "@/assets/experiences/snorkeling.jpg";
import photographyImg from "@/assets/experiences/photography.jpg";
import spaImg from "@/assets/experiences/spa.jpg";
import diningImg from "@/assets/experiences/dining.jpg";
import atvImg from "@/assets/experiences/atv.jpg";
import boatImg from "@/assets/experiences/boat.jpg";
import ziplineImg from "@/assets/experiences/zipline.jpg";
import horsebackImg from "@/assets/experiences/horseback.jpg";
import scubaImg from "@/assets/experiences/scuba.jpg";
import hikingImg from "@/assets/experiences/hiking.jpg";
import parasailingImg from "@/assets/experiences/parasailing.jpg";
import yogaImg from "@/assets/experiences/yoga.jpg";
import fishingImg from "@/assets/experiences/fishing.jpg";
import cookingImg from "@/assets/experiences/cooking.jpg";
import balloonImg from "@/assets/experiences/balloon.jpg";
import wineImg from "@/assets/experiences/wine.jpg";

// Restaurant components
import RestaurantCard from "@/components/RestaurantCard";
import { 
  mockRestaurants, 
  filterRestaurantsByLocation,
  type Restaurant 
} from "@/data/mockRestaurants";

const categories = [
  { id: "all", name: "All Experiences", icon: "✨" },
  { id: "Water Sports", name: "Water Sports", icon: "🌊" },
  { id: "Tours & Activities", name: "Tours & Activities", icon: "🗺️" },
  { id: "Transportation", name: "Transportation", icon: "🚴" },
  { id: "Food & Dining", name: "Food & Dining", icon: "🍷" },
  { id: "Wellness", name: "Wellness", icon: "💆" },
  { id: "Photography", name: "Photography", icon: "📸" },
];

const getExperienceImage = (experience: any) => {
  const imageMap: Record<number, string> = {
    1: kayakingImg,
    2: bikesImg,
    3: snorkelingImg,
    4: photographyImg,
    5: spaImg,
    6: diningImg,
    7: atvImg,
    8: boatImg,
    9: ziplineImg,
    10: horsebackImg,
    11: scubaImg,
    12: hikingImg,
    13: parasailingImg,
    14: yogaImg,
    15: fishingImg,
    16: cookingImg,
    17: balloonImg,
    18: wineImg,
  };
  return imageMap[experience.id] || kayakingImg;
};

const AppView2 = () => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyBusinesses();
  }, []);

  const fetchMyBusinesses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vendors' as any)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setMyBusinesses((data as any) || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      
      toast({
        title: prev.includes(id) ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
      
      return newFavorites;
    });
  };

  // Filter experiences
  const filteredExperiences = experiences.filter((exp) => {
    const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get restaurants
  const restaurants = mockRestaurants.slice(0, 8);

  // Get popular experiences (non-dining)
  const popularExperiences = experiences.filter((exp: any) => 
    !exp.category.toLowerCase().includes('dining') && 
    !exp.category.toLowerCase().includes('food')
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Landing Page Style */}
      <section className="relative overflow-hidden">
        {/* Background image with blur and overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: 'blur(2px)',
          }}
        />
        <div className="absolute inset-0 bg-background/60 dark:bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

        {/* Theme Toggle - Top Left */}
        <div className="absolute top-6 left-6 z-50">
          <ThemeToggle />
        </div>

        {/* AI Chat & Minimal Dock - Top Right */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <Link
            to="/trip-planner"
            className="p-2.5 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            title="AI Trip Planner"
          >
            <Sparkles className="h-5 w-5" />
          </Link>
          <MinimalDock />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="mb-4">
              <img src={stackdLogo} alt="stackd logo" className="h-48 w-48 sm:h-64 sm:w-64 lg:h-80 lg:w-80 drop-shadow-2xl mx-auto" />
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
              Discover Local Experiences
            </h2>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find amazing restaurants, adventures, and experiences near you.
            </p>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto pt-4">
              <div className="relative group">
                {/* Soft glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-purple-600/30 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition duration-300"></div>

                {/* Main search container */}
                <div className="relative bg-card rounded-full shadow-xl border border-border/30 backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:border-purple-500/20">
                  <div className="flex items-center px-6 py-4 gap-3">
                    <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <Input
                      placeholder="Search experiences, restaurants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    <button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-full p-3 flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full border whitespace-nowrap text-sm
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white border-transparent shadow-lg"
                      : "bg-card border-border/50 hover:border-purple-500/30 hover:shadow-md"
                  }
                `}
              >
                <span className="text-base">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>

          {/* My Businesses Section */}
          {myBusinesses.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Businesses</h2>
                <Link to="/host/vendors" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-2">
                  {myBusinesses.map((business) => (
                    <Link
                      key={business.id}
                      to={`/host/vendors`}
                      className="flex-shrink-0 w-[200px] group"
                    >
                      <div className="space-y-2">
                        <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-border group-hover:scale-105 transition-transform shadow-md">
                          <Store className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-1">{business.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{business.category}</p>
                          <p className="text-xs text-primary">{business.commission}% commission</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

          {/* Restaurants Near You */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Restaurants Near You</h2>
              <Link to="/restaurants" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-sm">View all</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-3" />
            </ScrollArea>
          </section>

          {/* Popular Experiences */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Popular Experiences</h2>
              <Link to="/experiences" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-sm">View all</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {popularExperiences.map((experience: any) => (
                  <Link
                    key={experience.id}
                    to={`/experience/${experience.id}`}
                    className="flex-shrink-0 w-[200px] group"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{
                            backgroundImage: `url(${getExperienceImage(experience)})`,
                          }}
                        />
                        
                        <button
                          onClick={(e) => toggleFavorite(experience.id, e)}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Heart
                            className={`h-5 w-5 transition-all drop-shadow-md ${
                              favorites.includes(experience.id)
                                ? "fill-red-500 text-red-500"
                                : "fill-black/50 text-white stroke-white stroke-2"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                          {experience.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {experience.vendor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ★ {experience.rating} · {experience.duration}
                        </p>
                        <div className="pt-0.5">
                          <span className="text-sm font-semibold">${experience.price}</span>
                          <span className="text-xs text-muted-foreground"> per person</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-3" />
            </ScrollArea>
          </section>

          {/* Experiences Grid */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">All Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pb-12">
              {filteredExperiences.map((experience) => (
                <Link key={experience.id} to={`/experience/${experience.id}`} className="block group">
                  <div className="space-y-2">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                        style={{
                          backgroundImage: `url(${getExperienceImage(experience)})`,
                        }}
                      />

                      {/* Heart/Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(experience.id, e)}
                        className="absolute top-2 right-2 z-20 p-1.5 rounded-full hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Heart
                          className={`h-5 w-5 transition-all drop-shadow-md ${
                            favorites.includes(experience.id)
                              ? "fill-red-500 text-red-500"
                              : "fill-black/50 text-white stroke-white stroke-2"
                          }`}
                        />
                      </button>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="space-y-0.5">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{experience.name}</h3>
                      </div>

                      <p className="text-xs text-muted-foreground">{experience.vendor}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{experience.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({experience.reviewCount})</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{experience.duration}</span>
                      </div>

                      {/* Price */}
                      <div className="pt-0.5">
                        <span className="text-sm font-semibold">${experience.price}</span>
                        <span className="text-muted-foreground text-xs"> per person</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Services Section */}
          <section className="space-y-6 py-8 border-t border-border">
            <div className="text-center">
              <img src={stackdLogo} alt="stackd" className="h-32 w-32 mx-auto" />
              <h2 className="text-2xl font-bold mt-4">Our Services</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center space-y-3 p-6 bg-card rounded-xl border border-border">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">For Customers</h3>
                <p className="text-sm text-muted-foreground">
                  Discover and book amazing local experiences with ease.
                </p>
              </div>

              <div className="text-center space-y-3 p-6 bg-card rounded-xl border border-border">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">For Airbnb Hosts</h3>
                <p className="text-sm text-muted-foreground">
                  Organize and maintain your affiliate relationships effortlessly.
                </p>
              </div>

              <div className="text-center space-y-3 p-6 bg-card rounded-xl border border-border">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">For Vendors</h3>
                <p className="text-sm text-muted-foreground">
                  Get additional advertising and promote your affiliate programs.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Footer */}
      <Footerdemo />
    </div>
  );
};

export default AppView2;
