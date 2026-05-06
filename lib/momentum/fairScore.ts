import {EditorState, FairScore, ScoreTip} from './types';

export function calculateFairScore(state: EditorState): FairScore {
    let findable = 20;
    let accessible = 0;
    let interoperable = 0;
    let reusable = 0;

    if (state.core.orcidValidated) {
        findable += 20;
        reusable += 20;
    }

    if (state.core.researchDomain) {
        findable += 30;
        interoperable += 20;
    }

    const hasDataObject = state.enabledModules.find((val) => val === "dataobject");
    const hasSoftware = state.enabledModules.find((val) => val === "software");
    const hasPublication = state.enabledModules.find((val) => val === "publication");

    if (hasDataObject && state.dataobject.dataUrlValidated) {
        accessible += 70;
        accessible += state.dataobject.dataUrl.startsWith("http") ? 30 : 0;
    }

    if (hasSoftware && state.software.repositoryUrlValidated) {
        accessible += 70;
    }

    if (hasDataObject && state.dataobject.mimeType.length > 0) {
        interoperable += 40;
        reusable += 20;
    }

    if ((hasDataObject || hasSoftware) && state.dataobject.license.length > 0 || state.software.license.length > 0) {
        reusable += 40;
    }

    if (hasSoftware && state.software.readmeUrl.length > 0) {
        reusable += 30;
    }
    if (hasSoftware && state.software.hasMetadata) {
        interoperable += 40;
    }

    if (hasSoftware && state.software.repositoryType?.length && state.software.repositoryType != "Other") {
        accessible += 30;
    }

    if (hasPublication && state.publication.doi.length > 0 && state.publication.title.length > 0) {
        findable += 30;
        accessible += 70;
    }

    if (hasPublication && state.publication.publicationType.length > 0) {
        interoperable += 30;
        reusable += 30;
    }

    if (state.misc && (state.misc.entries.length > 0)) {
        let attribIncrease = 0;
        state.misc.entries.forEach(entry => {
            if (Object.hasOwn(entry, 'typeDef')) {
                //add 10 points for typed attributes
                attribIncrease += 10;
            } else {
                //add 5 points for custom attributes
                attribIncrease += 5;
            }
        })
        reusable += Math.min(attribIncrease, 20);
        interoperable += Math.min(attribIncrease, 40);
    }

    findable = Math.min(findable, 100);
    accessible = Math.min(accessible, 100);
    interoperable = Math.min(interoperable, 100);
    reusable = Math.min(reusable, 100);

    const total = Math.min(Math.round((findable + accessible + interoperable + reusable) / 4), 100);

    return {
        findable: findable,
        accessible: accessible,
        interoperable: interoperable,
        reusable: reusable,
        total,
    };
}

export function calculateCurrentTip(state: EditorState): ScoreTip {
    const tips: ScoreTip[] = [];

    if (!state.core.orcidValidated) {
        tips.push({
            text: 'A valid ORCiD increases the Findability by +20%.',
            targetModule: 'core',
            scoreGain: 20,
        });
    }

    if (!state.core.researchDomain) {
        tips.push({
            text: 'A Research Domains increases Findability by 30% and Interoperability by +20%.',
            targetModule: 'core',
            scoreGain: 50,
        });
    }

    const hasDataObjectModule = state.enabledModules.find((val) => val === "dataobject");
    const hasSoftwareModule = state.enabledModules.find((val) => val === "software");

    if (hasDataObjectModule && !state.dataobject.dataUrlValidated) {
        tips.push({
            text: 'A valid data object URL increases the Findability by 30% and Accessibility by +40%.',
            targetModule: 'dataobject',
            scoreGain: 70,
        });
    }

    if (hasSoftwareModule && (state.software.repositoryType === "Other")) {
        tips.push({
            text: 'Using a standard software repository increases Findability and Accessibility by +30% each.',
            targetModule: 'software',
            scoreGain: 60,
        });
    }

    if (hasSoftwareModule && !state.software.repositoryUrl) {
        tips.push({
            text: 'A software repository URL increases Findability and Accessibility by +30% each.',
            targetModule: 'software',
            scoreGain: 60,
        });
    }

    const hasPublicationModule = state.enabledModules.find((val) => val === "publication");

    if (hasPublicationModule && (!state.publication?.doi || !state.publication.title)) {
        tips.push({
            text: 'Publication information increase Findability by 40%.',
            targetModule: 'publication',
            scoreGain: 40,
        });
    }

    if (!state.misc && state.template) {
        tips.push({
            text: 'Additional metadata may increase Interoperability and Reusability by up to 20%.',
            targetModule: 'misc',
            scoreGain: 40,
        });
    }

    const sortedTips = tips.sort((a, b) => b.scoreGain - a.scoreGain);

    if (sortedTips.length > 0) {
        return sortedTips[0];
    }

    return {
        text: 'Your FAIR-Score reached the maximum. No more tips available.',
        targetModule: state.activeModule,
        scoreGain: 0,
    };
}
