import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Home as HomeIcon, Heart, MapPin, MessageSquare, User, Search, Star, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { experiences } from "@/data/mockData";
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
import { toast } from "sonner";

const topTabs = [
  { id: "homes", name: "Homes", icon: "🏠" },
  { id: "experiences", name: "Experiences", icon: "🎈", badge: "NEW" },
  { id: "services", name: "Services", icon: "🔔", badge: "NEW" },
];

// Image mapping based on experience category and name
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

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopTab, setSelectedTopTab] = useState("experiences");
  const [selectedBottomTab, setSelectedBottomTab] = useState("explore");
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isLoggedIn && userRole) {
      if (userRole === "host") {
        navigate("/host/dashboard");
      } else if (userRole === "vendor") {
        navigate("/vendor/dashboard");
      }
    }
  }, [isLoggedIn, userRole, navigate]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      
      toast.success(
        prev.includes(id) 
          ? "Removed from favorites" 
          : "Added to favorites"
      );
      
      return newFavorites;
    });
  };

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch = searchQuery === "" || 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header with Search and Tabs */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        {/* Search Bar */}
        <div className="px-4 pt-3 pb-3">
          <button 
            onClick={() => toast.info("Search coming soon!")}
            className="w-full bg-card hover:bg-muted/50 transition-colors rounded-full shadow-md border border-border px-6 py-4 flex items-center gap-3"
          >
            <Search className="h-5 w-5 text-foreground" />
            <span className="text-base font-medium text-foreground">Start your search</span>
          </button>
        </div>

        {/* Icon Tabs */}
        <div className="flex items-center justify-around px-4 pb-3 border-b">
          {topTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTopTab(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 relative"
            >
              <div className="relative">
                <span className="text-2xl">{tab.icon}</span>
                {tab.badge && (
                  <Badge className="absolute -top-1 -right-6 text-[10px] px-1.5 py-0 bg-blue-600 text-white">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium ${
                selectedTopTab === tab.id ? "text-foreground" : "text-muted-foreground"
              }`}>
                {tab.name}
              </span>
              {selectedTopTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-6 space-y-8">
        {selectedTopTab === "experiences" && (
          <>
            {/* Section Header */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Explore Experiences</h2>
              
              {/* Experiences Grid */}
              <div className="grid grid-cols-2 gap-4">
                {filteredExperiences.slice(0, 12).map((experience) => (
                  <Link key={experience.id} to={`/experience/${experience.id}`} className="block">
                    <div className="space-y-2">
                      {/* Image with Heart */}
                      <div className="relative aspect-square overflow-hidden rounded-2xl">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${getExperienceImage(experience)})`,
                          }}
                        />
                        
                        {/* Heart Button */}
                        <button
                          onClick={(e) => toggleFavorite(experience.id, e)}
                          className="absolute top-3 right-3 z-10 p-1.5"
                        >
                          <Heart 
                            className={`h-6 w-6 transition-all drop-shadow-md ${
                              favorites.includes(experience.id) 
                                ? "fill-red-500 text-red-500" 
                                : "fill-black/50 text-white stroke-white stroke-2"
                            }`}
                          />
                        </button>

                        {/* Guest Favorite Badge */}
                        {experience.rating >= 4.8 && (
                          <div className="absolute bottom-3 left-3 bg-white rounded-full px-3 py-1 shadow-lg">
                            <span className="text-xs font-semibold">Guest favorite</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-sm line-clamp-1">{experience.name}</h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">{experience.rating}</span>
                        </div>

                        {/* Price */}
                        <div className="pt-0.5">
                          <span className="font-semibold text-sm">${experience.price}</span>
                          <span className="text-muted-foreground text-xs"> / person</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedTopTab === "homes" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <HomeIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Homes Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              Book amazing homes for your next trip.
            </p>
          </div>
        )}

        {selectedTopTab === "services" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Briefcase className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Services Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              Discover local services to enhance your stay.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex items-center justify-around px-4 py-2 max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedBottomTab("explore")}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <Search className={`h-6 w-6 ${
              selectedBottomTab === "explore" ? "text-red-500" : "text-muted-foreground"
            }`} />
            <span className={`text-[10px] font-medium ${
              selectedBottomTab === "explore" ? "text-red-500" : "text-muted-foreground"
            }`}>
              Explore
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedBottomTab("wishlists");
              toast.info("Wishlists feature coming soon!");
            }}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <Heart className={`h-6 w-6 ${
              selectedBottomTab === "wishlists" ? "text-red-500" : "text-muted-foreground"
            }`} />
            <span className={`text-[10px] font-medium ${
              selectedBottomTab === "wishlists" ? "text-red-500" : "text-muted-foreground"
            }`}>
              Wishlists
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedBottomTab("trips");
              if (isLoggedIn && userRole === "host") {
                navigate("/host/dashboard");
              } else {
                toast.info("Sign in to view your trips");
              }
            }}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <MapPin className={`h-6 w-6 ${
              selectedBottomTab === "trips" ? "text-red-500" : "text-muted-foreground"
            }`} />
            <span className={`text-[10px] font-medium ${
              selectedBottomTab === "trips" ? "text-red-500" : "text-muted-foreground"
            }`}>
              Trips
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedBottomTab("messages");
              toast.info("Messages feature coming soon!");
            }}
            className="flex flex-col items-center gap-1 py-2 px-4 relative"
          >
            <MessageSquare className={`h-6 w-6 ${
              selectedBottomTab === "messages" ? "text-red-500" : "text-muted-foreground"
            }`} />
            <span className={`text-[10px] font-medium ${
              selectedBottomTab === "messages" ? "text-red-500" : "text-muted-foreground"
            }`}>
              Messages
            </span>
            {/* Notification dot */}
            <div className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={() => {
              setSelectedBottomTab("profile");
              if (isLoggedIn) {
                if (userRole === "host") {
                  navigate("/host/profile");
                } else if (userRole === "vendor") {
                  navigate("/vendor/profile");
                }
              } else {
                navigate("/signin");
              }
            }}
            className="flex flex-col items-center gap-1 py-2 px-4"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              selectedBottomTab === "profile" ? "bg-red-500" : "bg-muted"
            }`}>
              <User className={`h-4 w-4 ${
                selectedBottomTab === "profile" ? "text-white" : "text-muted-foreground"
              }`} />
            </div>
            <span className={`text-[10px] font-medium ${
              selectedBottomTab === "profile" ? "text-red-500" : "text-muted-foreground"
            }`}>
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
