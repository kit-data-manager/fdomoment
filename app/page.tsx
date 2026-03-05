import Image from "next/image";
import ThemeToggle from '@/components/ThemeToggle';
import {Rocket} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen transition-colors duration-200">
       <header className="py-4 px-6 flex justify-between items-center border-b">
         <div className="flex-1 flex justify-center items-center">
           <div className="flex items-center gap-2 logo">
             <Image
               src="/logo_full.png"
               alt="FDO Moment Logo"
               width={640}
               height={89}
               className="justify-self-center"
             />
           </div>
         </div>
         <ThemeToggle />
      </header>
      
      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            <span className="font-mono">F</span>
              <span className="text-neutral-content">AIR</span>{" "}
              <span className="font-mono">D</span>
              <span className="text-neutral-content">igital</span>{" "}
              <span className="font-mono">O</span>
              <span className="text-neutral-content">bject</span>{" "}
              <span className="font-mono">Mo</span>
              <span className="text-neutral-content">dular</span>{" "}
              <span className="font-mono">M</span>
              <span className="text-neutral-content">inting and</span> {" "}
              <span className="font-mono">En</span>
              <span className="text-neutral-content">ablement</span>{" "}
              <span className="font-mono">T</span>
              <span className="text-neutral-content">oolkit</span>
          </h1>
          <p className="text-xl mb-8">
            Create your own FAIR Digital Objects in a modular and easy way. Once created, they can be cited in your publications, processed via available FDO tooling, or just persisted for the future.
          </p>
          <a
            href="/editor"
            className="btn btn-xl btn-soft btn-primary px-6 py-3 transition-colors duration-200"
          >
              <Rocket/>
            Launch Editor
          </a>
        </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="hover-3d">
                  <div className="p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Intuitive Interface</h3>
                      <p className="">Clean, intuitive design that makes FDO creation effortless.</p>
                  </div>
              </div>
              <div className="hover-3d">
                  <div className="p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Real PIDs</h3>
                      <p className="">Make your FDOs persistently accessible by assigning globally unique, persistent
                          identifiers.</p>
                  </div>
              </div>
              <div className="hover-3d">
                  <div className="p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Customization</h3>
                      <p className="">Besides kernel metadata, custom attributes can be added to your FDOs to support
                          specific use cases or branding.</p>
                  </div>
              </div>
              </div>
      </main>

        <footer className="py-6 px-6 text-center border-t">
        © {new Date().getFullYear()} Karlsruhe Institute of Technology (KIT)
      </footer>
    </div>
  );
}
