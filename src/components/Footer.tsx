import { Beaker, Github, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Beaker className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">VirtualLab</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering students and researchers with advanced computational tools and resources.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary transition-colors">Home</a>
              </li>
              <li>
                <a href="/timeline" className="hover:text-primary transition-colors">Academic Calendar</a>
              </li>
              <li>
                <a href="/virtual-lab" className="hover:text-primary transition-colors">Virtual Lab</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:lab@university.edu"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://informatika.stei.itb.ac.id/~rinaldi.munir/"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="External Link"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Virtual Laboratory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
