"use client"

import Image from "next/image";
import ThemeToggle from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { AppSelector } from '@/components/AppSelector';
import React from "react";
import Link from "next/link";
import {useTheme} from "@/context/ThemeContext";

export default function Home() {
    const { darkMode } = useTheme();

    return (
    <div className="flex flex-col h-screen transition-colors duration-200">
        <header className="py-4 px-6 border-b flex-shrink-0">
           <div className="flex justify-between items-center gap-4 mb-2">
             <div className="flex items-center gap-2 flex-shrink-0">
               <Image
                 src="/logo_small.png"
                 alt="FAIR DO Moment Logo"
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
                  Create your own FAIR Digital Objects—modular, intuitive, and built your way. Once created,
                  they’re ready to cite in your scientific publications, integrate with powerful tools, or securely preserve for the future.
                  Ready to get started?<br/>Proceed with <Link
                  href="/momentum"
                  className="text-primary hover:text-primary-focus transition-colors font-medium"
                >
                    Momentum →
                </Link> and build your first FAIR Digital Object today.
              </p>
            </div>

            <AppSelector/>

            <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="card bg-base-100 shadow-md">
                    <figure>
                        {darkMode && (
                        <img src="feature_supportive_dark.png" alt="Supportive" />
                        )}
                        {!darkMode && (
                            <img src="feature_supportive_light.png" alt="Supportive" />
                        )}
                    </figure>
                    <div className="card-body">
                        <h3 className="card-title">Supportive</h3>
                        <p>A clean and supportive user interface allows an effortless creation of FAIR Digital Objects, even for beginners,
                            while offering enough customizability for experts.</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-md">
                    <figure>
                        {darkMode && (
                        <img src="feature_versatile_dark.png" alt="Versatile" />
                            )}
                        {!darkMode && (
                            <img src="feature_versatile_light.png" alt="Versatile" />
                        )}
                    </figure>
                    <div className="card-body">
                        <h3 className="card-title">Versatile</h3>
                        <p>Assignment of true PIDs allows versatile use of created FAIR Digital Objects, e.g., in your publications, for available tooling,
                            or just for long-term persistence.</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-md">
                    <figure>
                        {darkMode && (
                        <img src="feature_transparent_dark.png" alt="Transparent" />
                            )}
                        {!darkMode && (
                            <img src="feature_transparent_light.png" alt="Transparent" />
                        )}
                    </figure>
                    <div className="card-body">
                        <h3 className="card-title">Transparent</h3>
                        <p>Access all your FAIR Digital Objects as well as comprehensive status information easily, at any time.</p>
                    </div>
                </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
  );
}
