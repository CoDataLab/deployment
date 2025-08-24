import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/reports'));
const WorkerPage = lazy(() => import('src/pages/dashboard/worker'));
const PipeLinePage = lazy(() => import('src/pages/dashboard/pipline'));
const TasksPage = lazy(() => import('src/pages/dashboard/tasks'));
const SourcesPage = lazy(() => import('src/pages/dashboard/sources'));
const SourceGroupsPage = lazy(() => import('src/pages/dashboard/sourceGroupes'));
const WarehousePage = lazy(() => import('src/pages/dashboard/datawarehouse'));
const ConsiderationsPage = lazy(() => import('src/pages/dashboard/considerations'));
const KeywordsArticlesPage  = lazy(() => import ('src/pages/dashboard/keywordsArticles')) ;
const ThinkBoardPage = lazy(() => import('src/pages/dashboard/thinkboard')) ;
const TensionPage = lazy(() => import('src/pages/dashboard/tension')) ;
const SchedulerPage = lazy(() => import('src/pages/dashboard/scheduler')) ;
const EjournalPage = lazy(() => import('src/pages/dashboard/ejournal')) ;
const NotesPage = lazy(() => import('src/pages/dashboard/notes')) ;
const ReaderPage = lazy(() => import('src/pages/dashboard/reader'));
const SearchPage = lazy(() => import('src/pages/dashboard/search'));
const MonitorPage =  lazy(() => import('src/pages/dashboard/monitor'));
const PdfGathererPage = lazy(() => import('src/pages/dashboard/PdfGatherer'));
const HistoricalEventsPage = lazy(() => import('src/pages/dashboard/historicalEvents'));
const TopicsPage = lazy(() => import('src/pages/dashboard/topics'));
const RealTimeEventsPage = lazy(() => import('src/pages/dashboard/realTimeView'));
const SourceAnalysisPage = lazy(() => import('src/pages/dashboard/sourceAnalysis'));
const PodcastsPage = lazy(() => import('src/pages/dashboard/podcasts'));
const MediaScaleIndexPage = lazy(() => import('src/pages/dashboard/mediaScaleIndex'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { path:'reports',element: <IndexPage />, index: true },
      { path: 'worker', element: <WorkerPage /> },
      { path: 'pipeline', element: <PipeLinePage /> },
      { path :'considerations',element:<ConsiderationsPage/>} ,
      { path :'tasks',element: <TasksPage />},
      { path  :'related-articles' ,element : <KeywordsArticlesPage/>},
      { path  :'thinkboard' ,element : <ThinkBoardPage/>},
      { path  :'tension' ,element : <TensionPage/>},
      { path  :'scheduler' ,element : <SchedulerPage/>},
      { path  :'ejournal' ,element : <EjournalPage/>},
      { path  :'notes' ,element : <NotesPage/>},
      { path  :'pdfArticle' ,element : <PdfGathererPage/>},
      { path  :'historicalEvents' ,element : <HistoricalEventsPage/>},
      { path  :'realTimeEvents' ,element : <RealTimeEventsPage/>},
      { path  :'mediaScaleIndex' ,element : <MediaScaleIndexPage/>},
      {
        path: 'read/:id',
        element: <ReaderPage />,
      },
            {
        path: 'source-analysis/:source',
        element: <SourceAnalysisPage />,
      },
      { path  :'search' ,element : <SearchPage/>},

      { path  :'monitor' ,element : <MonitorPage/>},
      {
        path: 'group',
        children: [
          { path: 'sources', element: <SourcesPage /> },
          { path: 'sourceGroups', element: <SourceGroupsPage /> },
          { path: 'topics', element: <TopicsPage /> },          
          { path: 'warehouse', element: <WarehousePage /> },
          { path: 'podcasts' ,element : <PodcastsPage/>},

        ],
      },
    ],
  },
];