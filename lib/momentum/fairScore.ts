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
  
  if (state.publication && state.publication.doi.length > 0 && state.publication.title.length > 0) {
      findable += 40;
      accessible += 30;
  }

  if(state.misc && (state.misc.entries.length > 0)) {
        reusable += Math.max(state.misc.entries.length * 5, 20);
        interoperable += Math.max(state.misc.entries.length * 5, 20);
  }

  const total = Math.min(Math.round((findable + accessible + interoperable + reusable) / 4), 100);

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
      text: 'A valid ORCiD increases the F-Score by +20%.',
      targetModule: 'core',
      scoreGain: 20,
    });
  }

  if (!state.basis.researchDomain) {
    tips.push({
      text: 'A Research Domains increases the F-Score by 30% and I-Score by +20%.',
      targetModule: 'core',
      scoreGain: 50,
    });
  }

  const isDataObjectTemplate = state.template === 'published-data-object' || state.template === 'unpublished-data-object';
  const isSoftwareTemplate = state.template === 'published-software' || state.template === 'unpublished-software';

  if (isDataObjectTemplate && !state.dataset.dataUrlValidated) {
    tips.push({
      text: 'A valid data object URL increases the F-Score by 30% and A-Score by +40%.',
      targetModule: 'dataobject',
      scoreGain: 70,
    });
  }

  if (isSoftwareTemplate && !state.software.repositoryUrl) {
    tips.push({
      text: 'A public repository URL increases F- and A-Score by +30% each.',
      targetModule: 'software',
      scoreGain: 60,
    });
  }

  const hasPublicationModule = state.template === 'published-data-object' || state.template === 'published-software';
  if (!state.publication && hasPublicationModule) {
    tips.push({
      text: 'Publication information increase the F-Score by 40% and the A-Score by +30%.',
      targetModule: 'publication',
      scoreGain: 70,
    });
  }

  if (!state.misc && state.template) {
    tips.push({
      text: 'Additional metadata improve the I-Score by up to 20% and R-Score by up to 20%.',
      targetModule: 'misc',
      scoreGain: 10,
    });
  }

  const sortedTips = tips.sort((a, b) => b.scoreGain - a.scoreGain);
  
  if (sortedTips.length > 0) {
    return sortedTips[0];
  }

  return {
    text: 'You\'re perfectly set. No more tips available.',
    targetModule: state.activeModule,
    scoreGain: 0,
  };
}
