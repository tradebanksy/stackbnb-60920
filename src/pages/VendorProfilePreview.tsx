import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Star, Heart, Eye, Edit, Globe, Plus, Trash2, Loader2, ImagePlus,
  User, Search, Sparkles, Store, ChevronRight, MapPin, CalendarDays
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import VendorBottomNav from '@/components/VendorBottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import stackdLogo from '@/assets/stackd-logo-new.png';
import heroImage from '@/assets/hero-beach.jpg';

interface VendorProfile {
  id: string;
  name: string;
  category: string;
  description: string | null;
  about_experience: string | null;
  instagram_url: string | null;
  photos: string[] | null;
  menu_url: string | null;
  price_per_person: number | null;
  duration: string | null;
  max_guests: number | null;
  included_items: string[] | null;
  google_rating: number | null;
  google_reviews_url: string | null;
  is_published: boolean | null;
  listing_type: string | null;
}

const VendorProfilePreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [locationQuery, setLocationQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [id, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('vendor_profiles')
        .select('*');
      
      if (id) {
        query = query.eq('id', id);
      } else {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!profile) return;
    
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ is_published: !profile.is_published })
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
      toast.success(profile.is_published ? 'Profile unpublished' : 'Profile published successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user || !profile) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vendor-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('vendor-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const currentPhotos = profile.photos || [];
      const newPhotos = [...currentPhotos, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from('vendor_profiles')
        .update({ photos: newPhotos })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, photos: newPhotos } : null);
      toast.success(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    if (!profile) return;

    try {
      const urlParts = photoUrl.split('/vendor-photos/');
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('vendor-photos').remove([filePath]);
      }

      const newPhotos = profile.photos?.filter((_, i) => i !== index) || [];
      
      const { error } = await supabase
        .from('vendor_profiles')
        .update({ photos: newPhotos })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, photos: newPhotos } : null);
      toast.success('Photo deleted');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-72 w-full" />
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No profile found</p>
          <Button onClick={() => navigate('/vendor/create-profile')}>
            Create Profile
          </Button>
        </div>
        <VendorBottomNav />
      </div>
    );
  }

  const photos = profile.photos || [];
  const isExperience = profile.listing_type === 'experience';

  return (
    <div className="min-h-screen h-screen w-screen bg-background flex justify-center overflow-hidden">
      {/* Phone Container - Matches AppView */}
      <div className="w-full max-w-[430px] h-full flex flex-col bg-background overflow-hidden relative">
        
        {/* Preview Banner */}
        <div className="flex-shrink-0 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Preview Mode - Guest View</span>
          </div>
          <Badge variant={profile.is_published ? "default" : "secondary"} className="text-xs">
            {profile.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />

        <Tabs defaultValue="explore" className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky Tabs Header */}
          <div className="flex-shrink-0 sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
            <TabsList className="w-full justify-start rounded-none bg-transparent h-10 p-0">
              <TabsTrigger 
                value="explore" 
                className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Explore
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Services
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="flex-1 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                About
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explore" className="flex-1 overflow-y-auto overflow-x-hidden pb-32 mt-0">
            {/* Hero Section */}
            <div className="relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${heroImage})`,
                  filter: 'blur(1px)',
                }}
              />
              <div className="absolute inset-0 bg-background/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-background/80 border border-border text-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Hero Content */}
              <div className="relative z-10 px-4 pb-4 pt-4 text-center">
                <img src={stackdLogo} alt="stackd" className="h-40 w-40 mx-auto mb-3" />
                <h1 className="text-xl font-bold text-foreground mb-1">
                  Discover Experiences
                </h1>
                <p className="text-xs text-muted-foreground mb-3">
                  Find amazing restaurants & adventures nearby
                </p>

                {/* Search Section */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-600/20 rounded-full blur-sm"></div>
                  <div className="relative bg-card/90 rounded-full border border-border/50 backdrop-blur-sm flex items-center px-3 py-2 gap-2">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <Input
                      placeholder="Where to?"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="border-0 bg-transparent text-sm h-6 shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground flex-1 min-w-0"
                      disabled
                    />
                    <div className="h-4 w-px bg-border/50 flex-shrink-0" />
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 min-w-[100px]" disabled>
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-xs whitespace-nowrap">
                            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "When?"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setCalendarOpen(false);
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <button className="bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full p-1.5 flex-shrink-0" disabled>
                      <Search className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-3 py-3 space-y-5">
              {/* Section showing YOUR listing */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    {isExperience ? 'Popular Experiences' : 'Restaurants Near You'}
                  </h2>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                  <div className="flex gap-3 w-max pb-2">
                    {/* YOUR LISTING - Highlighted */}
                    <div className="flex-shrink-0 w-36 relative">
                      {/* Highlight ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl opacity-75 blur-sm animate-pulse" />
                      <div className="relative">
                        <div className="aspect-square rounded-xl overflow-hidden relative border-2 border-primary">
                          {photos.length > 0 ? (
                            <img
                              src={photos[0]}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="w-full h-full bg-gradient-to-br from-orange-500 to-purple-600 flex flex-col items-center justify-center gap-1 hover:from-orange-600 hover:to-purple-700 transition-colors"
                            >
                              {isUploading ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                              ) : (
                                <>
                                  <ImagePlus className="h-6 w-6 text-white/80" />
                                  <span className="text-white text-[10px]">Add photo</span>
                                </>
                              )}
                            </button>
                          )}
                          <button className="absolute top-2 right-2 z-10">
                            <Heart className="h-5 w-5 drop-shadow-md fill-black/40 text-white" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs font-medium line-clamp-1">{profile.name}</p>
                            <div className="flex items-center gap-1 text-white/80 text-[10px]">
                              {profile.google_rating && (
                                <>
                                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                  <span>{profile.google_rating}</span>
                                  <span>•</span>
                                </>
                              )}
                              {isExperience && profile.price_per_person ? (
                                <span>${profile.price_per_person}</span>
                              ) : (
                                <span>{profile.category}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Your listing badge */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 shadow-lg">
                            Your Listing
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Placeholder cards */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-shrink-0 w-36 opacity-50">
                        <div className="aspect-square rounded-xl overflow-hidden relative bg-muted">
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                            <Store className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <div className="h-3 bg-white/30 rounded w-20 mb-1" />
                            <div className="h-2 bg-white/20 rounded w-14" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Photo Management Section */}
              {photos.length > 0 && (
                <section className="space-y-3 bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Manage Photos</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="gap-1 text-xs"
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      Add
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden relative group"
                      >
                        <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeletePhoto(photo, idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-1 left-1">
                            <Badge variant="secondary" className="text-[8px] px-1 py-0">
                              Main
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="flex-1 overflow-y-auto pb-32 mt-0">
            <div className="p-4 text-center text-muted-foreground text-sm">
              Services tab preview
            </div>
          </TabsContent>

          <TabsContent value="about" className="flex-1 overflow-y-auto pb-32 mt-0">
            <div className="p-4 text-center text-muted-foreground text-sm">
              About tab preview
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Bar */}
        <div className="absolute bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => navigate('/vendor/create-profile')}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              <Globe className="h-4 w-4" />
              {isPublishing ? 'Updating...' : profile.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        <VendorBottomNav />
      </div>
    </div>
  );
};

export default VendorProfilePreview;