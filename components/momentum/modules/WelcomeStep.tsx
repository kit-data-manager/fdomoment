'use client';

import React from 'react';
import { ObjectType } from '@/lib/momentum/types';

interface WelcomeStepProps {
  setObjectType: (type: ObjectType) => void;
  setActiveModule: (module: string) => void;
  currentObjectType: ObjectType;
}

export function WelcomeStep({
  setObjectType,
  setActiveModule,
  currentObjectType,
}: WelcomeStepProps) {
  const handleSelect = (type: 'dataobject' | 'software') => {
    setObjectType(type);
    setActiveModule(type);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Please choose the type of your research object.
          </h2>
          <p className="text-base-content/70">
            You describe an object. Choose the type which matches best. Your choice defines, which metadata must be provided.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Data Object Card */}
          <div
            className={`card border-2 cursor-pointer transition-all hover:shadow-md ${
              currentObjectType === 'dataobject'
                ? 'border-primary bg-primary/5'
                : 'border-base-200 bg-base-100 hover:border-primary/50'
            }`}
            onClick={() => handleSelect('dataobject')}
          >
            <div className="card-body items-center text-center p-6">
              <div className="text-4xl mb-2">🗄️</div>
              <h3 className="card-title">Datensatz</h3>
              <p className="text-sm text-base-content/70 mt-2">
                Measurement, Surveys, Images, Tables, or Simulation Data
              </p>
              <div className="card-actions mt-4">
                {currentObjectType === 'dataobject' ? (
                  <span className="badge badge-primary">Selected ✓</span>
                ) : (
                  <button className="btn btn-primary btn-sm">
                    Select Data Object
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Software Card */}
          <div
            className={`card border-2 cursor-pointer transition-all hover:shadow-md ${
              currentObjectType === 'software'
                ? 'border-primary bg-primary/5'
                : 'border-base-200 bg-base-100 hover:border-primary/50'
            }`}
            onClick={() => handleSelect('software')}
          >
            <div className="card-body items-center text-center p-6">
              <div className="text-4xl mb-2">💻</div>
              <h3 className="card-title">Software</h3>
              <p className="text-sm text-base-content/70 mt-2">
                Source Code, Workflows, Tools, Scripts
              </p>
              <div className="card-actions mt-4">
                {currentObjectType === 'software' ? (
                  <span className="badge badge-primary">Selected ✓</span>
                ) : (
                  <button className="btn btn-primary btn-sm">
                    Select Software
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-base-content/50 text-center">
          ℹ️ You may change the type later.
        </p>
      </div>
    </div>
  );
}
