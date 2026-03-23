import { EditorState, FairScore, ScoreTip } from './types';

export function calculateFairScore(state: EditorState): FairScore {
  let findable = 0;
  let accessible = 0;
  let interoperable = 0;
  let reusable = 0;

  if (state.basis.orcidValidated) {
    findable += 20;
  }
  
  if (state.basis.researchDomain) {
    findable += 20;
    interoperable += 30;
  }
  
  if (state.publication && state.publication.doi.length > 0) {
    findable += 30;
    accessible += 30;
  }
  
  if (state.dataset.dataUrlValidated) {
    findable += 30;
    accessible += 40;
  }
  
  if (state.software.repositoryUrl.length > 0) {
    findable += 30;
    accessible += 30;
  }
  
  if (state.dataset.mimeType.length > 0 || state.software.repositoryUrl.length > 0) {
    interoperable += 40;
  }
  
  if (state.dataset.license.length > 0 || state.software.license.length > 0) {
    interoperable += 30;
    reusable += 40;
  }
  
  if (state.dataset.licenseUrl.length > 0 || state.software.licenseImported) {
    reusable += 30;
  }
  
  if (state.software.readmeUrl.length > 0) {
    reusable += 30;
  }
  
  if (state.publication && (state.publication.doi.length > 0 || state.publication.title.length > 0)) {
    reusable += 30;
  }

  const total = Math.round((findable + accessible + interoperable + reusable) / 4);

  return {
    findable: Math.min(findable, 100),
    accessible: Math.min(accessible, 100),
    interoperable: Math.min(interoperable, 100),
    reusable: Math.min(reusable, 100),
    total,
  };
}

export function calculateCurrentTip(state: EditorState): ScoreTip {
  const tips: ScoreTip[] = [];

  if (!state.basis.orcidValidated) {
    tips.push({
      text: 'Eine validierte ORCiD steigert den F-Score um +20%',
      targetModule: 'basis',
      scoreGain: 20,
    });
  }

  if (!state.basis.researchDomain) {
    tips.push({
      text: 'Ein Forschungsbereich steigert F- und I-Score um +50%',
      targetModule: 'basis',
      scoreGain: 50,
    });
  }

  if (state.objectType === 'dataset' && !state.dataset.dataUrlValidated) {
    tips.push({
      text: 'Eine validierte Daten-URL steigert F- und A-Score um +70%',
      targetModule: 'dataset',
      scoreGain: 70,
    });
  }

  if (state.objectType === 'software' && !state.software.repositoryUrl) {
    tips.push({
      text: 'Eine Repository-URL steigert F- und A-Score um +60%',
      targetModule: 'software',
      scoreGain: 60,
    });
  }

  if (!state.publication && state.objectType) {
    tips.push({
      text: 'Eine DOI steigert den A-Score um +30%',
      targetModule: 'publication',
      scoreGain: 30,
    });
  }

  if (!state.misc && state.objectType) {
    tips.push({
      text: 'Zusätzliche Metadaten verbessern die Nachnutzbarkeit',
      targetModule: 'misc',
      scoreGain: 10,
    });
  }

  const sortedTips = tips.sort((a, b) => b.scoreGain - a.scoreGain);
  
  if (sortedTips.length > 0) {
    return sortedTips[0];
  }

  return {
    text: 'Alle Metadaten sind vollständig!',
    targetModule: state.activeModule,
    scoreGain: 0,
  };
}
