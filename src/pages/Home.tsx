import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Award, Newspaper, Loader2 } from "lucide-react";
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

interface Highlight {
  type: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

const Home = () => {
  //  data while loading or if API fails
  const Courses = [
    { code: "IF1220", name: "Matematika Diskrit" },
    { code: "IF2120", name: "Probabilitas dan Statistik" },
    { code: "IF2123", name: "Aljabar Linear dan Geometri" },
    { code: "IF2211", name: "Strategi Algoritma" },
    { code: "IF2224", name: "Teori Bahasa Formal dan Otomata" },
  ];

  const Highlights = [
    {
      type: "tasks",
      title: "Tugas Akhir Semester",
      description: "Lakukan optimasasi algoritma pencarian untuk dataset besar.",
      image: "https://images.unsplash.com/photo-1635372722656-389f87a941b7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1931",
      date: "2025-10-15",
    },
    {
      type: "publication",
      title: "Paper Published in IEEE Transactions",
      description: "Latest research on graph algorithms published in top-tier journal.",
      image: "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800&q=80",
      date: "2025-10-10",
    },
    {
      type: "project",
      title: "Virtual Lab Tools Expansion",
      description: "New computational tools added to our virtual laboratory platform.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
      date: "2025-10-05",
    },
  ];

  const Assistants = [
    {
      name: "Ahmad Naufal (IF'22)",
      role: "Head Assistant",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    },
    {
      name: "Ikhwan Al Hakim (IF'22)",
      role: "Research Assistant", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    {
      name: "Ariel Hefrison (IF'22)",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    },
    {
      name: "Farhan Nafis (IF'22)",
      role: "Teaching Assistant",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    },
    {
      name: "Haikal Assyauqi (IF'22)",
      role: "Head Assistant",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    },
    {
      name: "Raden Francisco (IF'22)",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    {
      name: "Aland Mulia Pratama (IF'22)",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    },
    {
      name: "Ahmad Rafi (IF'22)",
      role: "Teaching Assistant",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    },
    {
      name: "Eka Prawira (IF'22)",
      role: "Head Assistant",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    },
    {
      name: "Suthasoma Mahardika (IF'22)",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    {
      name: "Muhammad Fauzan (IF'22)",
      role: "Research Assistant",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    },
    {
      name: "Marvin Scifo (IF'22)",
      role: "Teaching Assistant",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    },
  ];

  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

  const courses = Courses;
  const highlights = Highlights;
  const assistants = Assistants;

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

            <Dialog open={!!selectedHighlight} onOpenChange={(isOpen) => !isOpen && setSelectedHighlight(null)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {highlights.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden card-elevated h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          <Newspaper className="inline h-3 w-3 mr-1" />
                          NEWS
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(item.date).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground flex-1">{item.description}</p>
                        <DialogTrigger asChild>
                          <Button 
                            variant="link" 
                            className="mt-4 p-0 h-auto self-start"
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

              <DialogContent className="sm:max-w-lg">
                {selectedHighlight && (
                  <>
                    <img
                      src={selectedHighlight.image}
                      alt={selectedHighlight.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <DialogHeader className="pt-4">
                      <DialogTitle>{selectedHighlight.title}</DialogTitle>
                      <DialogDescription>
                        {new Date(selectedHighlight.date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground">
                      {selectedHighlight.description}
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {assistants.map((assistant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="text-center card-elevated p-6">
                    <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/20">
                      <img
                        src={assistant.image}
                        alt={assistant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{assistant.name}</h3>
                    <p className="text-sm text-muted-foreground">{assistant.role}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
