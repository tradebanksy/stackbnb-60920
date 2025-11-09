import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Home, User, MessageCircle, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { experiences } from "@/data/mockData";
import stackdLogo from "@/assets/stackd-logo.png";
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

const getExperienceImage = (experience) => {
  const imageMap = {
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

const AppView = () => {
  const [activeTab, setActiveTab] = useState<"homes" | "experiences" | "services">("experiences");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

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

  const filteredExperiences = experiences.filter((exp) =>
    searchQuery === "" || 
    exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[450px] mx-auto px-4 py-3 space-y-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <img src={stackdLogo} alt="stackd" className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              stackd
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur opacity-20"></div>
            <div className="relative bg-muted rounded-full shadow-lg border border-border/50 overflow-hidden">
              <div className="flex items-center px-4 py-3 gap-2">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Start your search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[88px] z-30 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[450px] mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setActiveTab("homes")}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                activeTab === "homes" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Homes</span>
            </button>

            <button
              onClick={() => setActiveTab("experiences")}
              className={`relative flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                activeTab === "experiences" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Calendar className="h-5 w-5" />
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">Experiences</span>
                <Badge className="h-4 px-1 text-[8px] bg-gradient-to-r from-orange-500 to-pink-500 border-0">NEW</Badge>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`relative flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
                activeTab === "services" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">Services</span>
                <Badge className="h-4 px-1 text-[8px] bg-gradient-to-r from-orange-500 to-pink-500 border-0">NEW</Badge>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[450px] mx-auto px-4 pt-4">
        {/* Experiences Grid */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {filteredExperiences.map((experience) => (
            <Link
              key={experience.id}
              to={`/experience/${experience.id}`}
              className="block group"
            >
              <div className="space-y-2">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url(${getExperienceImage(experience)})`,
                    }}
                  />
                  
                  {/* Heart Icon */}
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

                  {/* Guest Favorite Badge */}
                  {experience.rating >= 4.8 && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-white/95 text-foreground backdrop-blur-sm shadow-sm text-[10px] px-2 py-0.5 border-0">
                        Guest favorite
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 shadow-lg">
        <div className="max-w-[450px] mx-auto flex justify-around items-center h-16">
          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-foreground">
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>

          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <Heart className="h-5 w-5" />
            <span className="text-[10px]">Wishlists</span>
          </Link>

          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-[10px]">Trips</span>
          </Link>

          <Link to="/appview" className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <div className="absolute top-2 right-1/4 h-2 w-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
            <span className="text-[10px]">Messages</span>
          </Link>

          <Link to="/appview" className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AppView;
