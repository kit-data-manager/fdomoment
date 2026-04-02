import Image from "next/image";
import ThemeToggle from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { AppSelector } from '@/components/AppSelector';
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen transition-colors duration-200">
        <header className="py-4 px-6 border-b flex-shrink-0">
           <div className="flex justify-between items-center gap-4 mb-2">
             <div className="flex items-center gap-2 flex-shrink-0">
               <Image
                 src="/logo_small.png"
                 alt="FDO Moment Logo"
                 width={60}
                 height={60}
               />
                 <div className="flex">
                     <h1 className="text-center text-primary">
                         <div className="flex flex-col sm:flex-row gap-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
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
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center mb-8">
              <p className="mb-4">
                Create your own FAIR Digital Objects in a modular and easy way. Once created, they can be cited in your scientific publications, processed via available tooling,
                or just kept persisted for the future.<br/>
                Ready for creating your first FAIR Digital Object? Then proceed with <Link
                  href="/momentum"
                  className="text-primary hover:text-primary-focus transition-colors font-medium"
                >
                    Momentum →
                </Link>, our FAIR Digital Object creation tool.
              </p>
            </div>

            <AppSelector/>

            <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="card bg-base-100 shadow-md">
                    <figure>
                        <img src="https://placehold.co/400x200?text=Intuitive+Interface" alt="Intuitive Interface" />
                    </figure>
                    <div className="card-body">
                        <h3 className="card-title">Intuitive Interface</h3>
                        <p>Clean, intuitive design that makes FDO creation effortless.</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-md">
                    <figure>
                        <img src="https://placehold.co/400x200?text=Real+PIDs" alt="Real PIDs" />
                    </figure>
                    <div className="card-body">
                        <h3 className="card-title">Real PIDs</h3>
                        <p>Make your FDOs persistently accessible by assigning globally unique, persistent
                            identifiers.</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-md">
                    <figure>
                        <img src="https://placehold.co/400x200?text=Customization" alt="Customization" />
                    </figure>
                    <div className="card-body">
                        <h3 className="card-title">Customization</h3>
                        <p>Besides kernel metadata, custom attributes can be added to your FDOs to support
                            specific use cases or branding.</p>
                    </div>
                </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
  );
}
