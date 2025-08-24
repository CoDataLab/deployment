// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
    dashboard: {
    root: `${ROOTS.DASHBOARD}/reports`,
    worker: `${ROOTS.DASHBOARD}/worker`,
    pipeline: `${ROOTS.DASHBOARD}/pipeline`,
    group: {
      root: `${ROOTS.DASHBOARD}/pipeline`,
      sources: `${ROOTS.DASHBOARD}/group/sources`,
      sourceGroups: `${ROOTS.DASHBOARD}/group/sourceGroups`,
      topics: `${ROOTS.DASHBOARD}/group/topics`,      
      warehouse: `${ROOTS.DASHBOARD}/group/warehouse`,
      podcasts: `${ROOTS.DASHBOARD}/group/podcasts`,

    },
    considerations: `${ROOTS.DASHBOARD}/considerations`,
    tasks: `${ROOTS.DASHBOARD}/tasks`,
    keywordsarticles:`${ROOTS.DASHBOARD}/related-articles`,
    thinkboard : `${ROOTS.DASHBOARD}/thinkboard`,
    tension : `${ROOTS.DASHBOARD}/tension`,
    scheduler : `${ROOTS.DASHBOARD}/scheduler`,
    ejournal : `${ROOTS.DASHBOARD}/ejournal`,
    notes : `${ROOTS.DASHBOARD}/notes`,
    reader: `${ROOTS.DASHBOARD}/reader`,
    search: `${ROOTS.DASHBOARD}/search`,
    monitor:`${ROOTS.DASHBOARD}/monitor`,
    pdfArticle:`${ROOTS.DASHBOARD}/pdfArticle`,
    historicalEvents: `${ROOTS.DASHBOARD}/historicalEvents`,
    realTimeEvents: `${ROOTS.DASHBOARD}/realTimeEvents`,
    mediaScaleIndex: `${ROOTS.DASHBOARD}/mediaScaleIndex`,
  },
};