const SCORING_CONFIG = {
    
    WEIGHTS: {
        neutrality: 0.30,
        bias: 0.20,
        type: 0.15,
        rate: 0.15,
        category: 0.15,
        language: 0.05,
    },
    
    LANGUAGE_SCORES: {
        'english': 10.0,
        'french': 9.0,
        'spanish': 9.0,
        'german': 9.0,
        'arabic': 8.0,
        'other': 7.0
    },
    
    CATEGORY_SCORES: {
        'world': 10.0,
        'politics': 10.0,
        'animals': 2.5,
        'business': 7.0,
        'cryptocurrencies': 4.0,
        'culture': 4.0,
        'education': 4.0,
        'entertainment': 7.0,
        'environment': 4.0,
        'health': 4.0,
        'lifestyle': 4.0,
        'science': 2.5,
        'sports': 4.0,
        'technology': 4.0,
        'gaming': 4.0,
        'unknown': 3.0,
    },
    
    SOURCE_TYPE_SCORES: {
        'website': 10.0,
        'youtube': 8.0,
        'telegram': 3.0,
        'blog': 5.0,
        'podcast': 5.0,
        'television': 5.0,
        'radio': 5.0,
        'unknown': 1.0,
    },
    
    BIAS_MAP: {
        'center': 0.5,
        'unknown': 0.25,
        'lean left': 1.25,
        'lean right': 1.25,
        'left': 2.5,
        'right': 2.5,
    },
    
    NON_ENGLISH_NEUTRALITY_SCORE: 5.0,
    MAX_BIAS_VALUE: 2.5
};

module.exports = {SCORING_CONFIG};