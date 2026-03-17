import Image from "next/image";
import ThemeToggle from '@/components/ThemeToggle';
import {Rocket} from "lucide-react";
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen transition-colors duration-200">
       <header className="py-4 px-6 border-b">
          <div className="flex justify-between items-center gap-4 mb-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/logo_small.png"
                alt="FDO Moment Logo"
                width={120}
                height={120}
                className="logo w-20 h-20 md:w-24 md:h-24"
              />
                <div className="flex justify-center">
                    <h1 className="text-center text-primary">
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                            <div className="flex gap-1">
                                <span className="font-mono">F</span><span className="text-neutral-content text-base">AIR</span>{" "}
                                <span className="font-mono">D</span><span className="text-neutral-content text-base">igital</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="font-mono">O</span><span className="text-neutral-content text-base">bject</span>{" "}
                                <span className="font-mono">MO</span><span className="text-neutral-content text-base">dular</span>{" "}
                                <span className="font-mono">M</span><span className="text-neutral-content text-base">inting</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-neutral-content text-base">&amp;</span>{" "}
                            </div>
                            <div className="flex gap-1">
                                <span className="font-mono">EN</span><span className="text-neutral-content text-base">ablement</span>{" "}
                                <span className="font-mono">T</span><span className="text-neutral-content text-base">oolkit</span>
                            </div>
                        </div>
                    </h1>
                </div>

            </div>
            <ThemeToggle />
          </div>
          

       </header>
       
       <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <p className="text-lg sm:text-xl mb-8">
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

        <Footer />
      </div>
  );
}
