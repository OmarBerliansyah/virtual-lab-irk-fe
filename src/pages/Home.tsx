import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Award, Newspaper, Loader2, ExternalLink, Edit, User } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useEvents } from "@/hooks/use-api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAssistants } from "@/hooks/useAssistants";
import { Courses } from "@/lib/data";
import type { Event } from "@/types/api";
import AssistantProfileEdit from "@/components/AssistantProfileEdit";


const Home = () => {
  // Fetch events from API
  const { data: allEvents, isLoading: eventsLoading, error: eventsError } = useEvents();
  
  // Get user profile for role-based features
  const { user, loading: profileLoading } = useUserProfile();
  
  // Fetch assistants from API
  const { data: apiAssistants, isLoading: assistantsLoading, error: assistantsError } = useAssistants(true);
  
  // Filter highlight events
  const highlightEvents = allEvents?.filter(event => event.type === 'highlight') || [];

  const [selectedHighlight, setSelectedHighlight] = useState<Event | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<typeof apiAssistants[0] | null>(null);

  const courses = Courses;
  // Use real highlight events or fallback data
  const highlights = highlightEvents.length > 0 ? highlightEvents : [];
  
  // Use API assistants or fallback to hardcoded data
  const assistants = apiAssistants && apiAssistants.length > 0 ? apiAssistants.map(assistant => ({
    name: `${assistant.name} (${assistant.angkatan})`,
    role: assistant.role,
    image: assistant.image || 'https://media.istockphoto.com/id/1477583639/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=OWGIPPkZIWLPvnQS14ZSyHMoGtVTn1zS8cAgLy1Uh24='
  })) : [];
  
  // Check if user is assistant or admin
  const canUploadProfilePicture = user?.role === 'assistant' || user?.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto text-center"
          >
            <p className="text-xl md:text-2xl mb-3 text-white/90">
              Selamat Datang di Portal
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Laboratorium Ilmu Rekayasa dan Komputasi
            </h1>
            <p className="text-lg mb-10 text-white/80 max-w-4xl mx-auto">
              Kami memfasilitasi penelitian terkait dengan pengambilan 
              dan penyaringan informasi, mesin pencari, ekstraksi informasi, sistem rekomendasi, peringkasan dokumen, 
              pemrosesan teks, linguistik komputasi, kriptografi, teori pengkodean, metode kompresi, simulasi komputer, 
              teori komputasi, desain dan analisis algoritma, kompleksitas komputasi, metode numerik, bahasa formal 
              dan automata, desain kompiler.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/virtual-lab">
                <Button size="lg" variant="secondary" className="group">
                  Explore Tools
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/timeline">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  View Calendar
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary">
              About Our Laboratory
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Kami berdedikasi untuk memajukan pendidikan ilmu komputasi melalui perangkat 
              virtual inovatif dan penelitian kolaboratif. Laboratorium kami berfungsi sebagai 
              pusat bagi mahasiswa dan peneliti untuk mengembangkan keterampilan praktis dalam 
              algoritma, sistem, dan pemecahan masalah komputasi. Berikut adalah beberapa mata kuliah yang kami ampu:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {courses.map((course, index) => (
                <motion.div
                  key={course.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-4 text-center card-elevated border-primary/20">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-sm mb-1">{course.code}</h3>
                    <p className="text-xs text-muted-foreground">{course.name}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
              Latest Highlights
            </h2>

            {/* Loading State */}
            {eventsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading highlights...</span>
              </div>
            )}

            {/* Error State */}
            {eventsError && !eventsLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Unable to load highlights from server. Showing sample content.
                </p>
              </div>
            )}

            {/* No Highlights Available */}
            {!eventsLoading && !eventsError && highlightEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No highlights available yet. Check back soon for updates!
                </p>
              </div>
            )}

            <Dialog open={!!selectedHighlight} onOpenChange={(isOpen) => !isOpen && setSelectedHighlight(null)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden card-elevated h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <Newspaper className="h-12 w-12 text-primary/60" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                          <Award className="inline h-3 w-3 mr-1" />
                          HIGHLIGHT
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(item.start).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{item.title}</h3>
                          <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground ml-2">
                            {item.course}
                          </span>
                        </div>
                        <p className="text-muted-foreground flex-1 line-clamp-3">
                          {item.description || "No description available."}
                        </p>
                        
                        {/* Link attachments preview */}
                        {item.linkAttachments && item.linkAttachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">
                              {item.linkAttachments.length} link{item.linkAttachments.length > 1 ? 's' : ''} attached
                            </p>
                          </div>
                        )}
                        
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-4 self-start bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 text-primary hover:text-primary font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => setSelectedHighlight(item)}
                          >
                            Read more <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                {selectedHighlight && (
                  <>
                    {selectedHighlight.photoUrl ? (
                      <img
                        src={selectedHighlight.photoUrl}
                        alt={selectedHighlight.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center rounded-lg mb-4">
                        <Award className="h-12 w-12 text-primary/60" />
                      </div>
                    )}
                    
                    <DialogHeader>
                      <div className="flex items-start justify-between">
                        <DialogTitle className="flex-1">{selectedHighlight.title}</DialogTitle>
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground ml-2">
                          {selectedHighlight.course}
                        </span>
                      </div>
                      <DialogDescription>
                        {new Date(selectedHighlight.start).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {selectedHighlight.description && (
                        <div className="py-4 text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedHighlight.description}
                        </div>
                      )}
                      
                      {selectedHighlight.linkAttachments && selectedHighlight.linkAttachments.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm mb-3">Related Links</h4>
                          <div className="space-y-2">
                            {selectedHighlight.linkAttachments.map((link, index) => (
                              <a 
                                key={index}
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline p-2 rounded border border-border hover:bg-muted/50 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1">{link.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>



      {/* Assistants Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary">
                Our Team
              </h2>
              {assistantsError && (
                <p className="text-sm text-muted-foreground mt-2">
                  Loading team from database... (Using fallback data)
                </p>
              )}
            </div>
            
            {/* Loading State for Assistants */}
            {assistantsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading team members...</span>
              </div>
            )}

            {/* Assistants Grid */}
            {!assistantsLoading && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                  {apiAssistants?.map((assistant, index) => (
                    <motion.div
                      key={assistant._id || assistant.email + index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="text-center card-elevated p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative group">
                        <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/20">
                          <img
                            src={assistant.image}
                            alt={assistant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://media.istockphoto.com/id/1477583639/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=OWGIPPkZIWLPvnQS14ZSyHMoGtVTn1zS8cAgLy1Uh24=';
                            }}
                          />
                          {/* Edit overlay - show for assistants and admins */}
                          {(user?.role === 'assistant' || user?.role === 'admin') && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedAssistant(assistant);
                                }}
                                className="bg-white/90 hover:bg-white text-primary"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{assistant.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{assistant.role}</p>
                        <div className="text-xs text-muted-foreground">
                          <p>{assistant.nim}</p>
                          <p>{assistant.angkatan}</p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {/* Assistant Edit Dialog */}
                <Dialog open={!!selectedAssistant} onOpenChange={(open) => !open && setSelectedAssistant(null)}>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Edit Assistant Profile
                      </DialogTitle>
                      <DialogDescription>
                        Update the assistant's profile information and photo.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedAssistant && (
                      <AssistantProfileEdit 
                        assistantData={selectedAssistant}
                        onUpdateSuccess={() => {
                          setSelectedAssistant(null);
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
